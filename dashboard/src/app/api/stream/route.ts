import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const client = await clientPromise;
  const db = client.db("fraud_detection");

  const stream = new ReadableStream({
    async start(controller) {
      const pushData = async () => {
        try {
          const fetchRecent = async (collectionName: string, filterProcessed: boolean = true) => {
            const query = filterProcessed ? { processed: { $ne: true } } : {};
            return await db.collection(collectionName)
              .find(query)
              .sort({ _id: -1 })
              .limit(10)
              .toArray();
          };

          const [input_stream, injected_events, bronze, silver, gold, inference, final, rejected] = await Promise.all([
            db.collection("transactions_input")
              .find({ is_control_message: { $ne: true } })
              .sort({ _id: -1 })
              .limit(10)
              .toArray(),
            db.collection("injected_events_queue")
              .find({ is_control_message: { $ne: true } })
              .sort({ _id: -1 })
              .limit(10)
              .toArray(),
            fetchRecent("transactions_bronze"),
            fetchRecent("transactions_silver"),
            fetchRecent("transactions_gold"),
            fetchRecent("inference_results"),
            fetchRecent("final_results", false), // Show all final results
            fetchRecent("transactions_rejected", false) // Show all rejected
          ]);

          const lastApiEvent = await db.collection("injected_events_queue")
            .find({ target: "silver_api" })
            .sort({ _id: -1 })
            .limit(1)
            .next();
          const apiStatus = (lastApiEvent && lastApiEvent.is_down) ? "DOWN" : "UP";

          const rejectsCount = await db.collection("transactions_rejected").countDocuments();
          const humanReviewCount = await db.collection("transactions_gold").countDocuments({ needs_manual_review: true });

          let driftSum = 0;
          let driftCount = 0;
          for (const doc of silver) {
            if (doc.ml_features && typeof doc.ml_features.drift_score === 'number') {
              driftSum += doc.ml_features.drift_score;
              driftCount++;
            }
          }
          const nightlyDriftLevel = driftCount > 0 ? Math.round((driftSum / driftCount) * 100) : 0;

          const logs = await db.collection("pipeline_logs")
            .find()
            .sort({ timestamp: -1 })
            .limit(15)
            .toArray();

          const payload = JSON.stringify({
            input: [...injected_events, ...input_stream]
              .filter(doc => doc.is_control_message === undefined)
              .sort((a, b) => b._id.toString().localeCompare(a._id.toString())) // Safer sort for mixed ID types
              .slice(0, 10),
            bronze,
            silver,
            gold,
            inference,
            final,
            rejected,
            logs: logs.reverse(), // Send in chronological order
            metrics: {
              rejectsCount,
              apiStatus,
              humanReviewCount,
              nightlyDriftLevel
            }
          });

          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (err) {
          console.error("SSE Error:", err);
        }
      };

      // Push immediately, then every 2 seconds
      await pushData();
      const interval = setInterval(pushData, 2000);

      // Cleanup when client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
