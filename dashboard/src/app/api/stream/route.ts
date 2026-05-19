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
              .toArray();
          };

          const [input_stream, injected_events, bronze, silver, gold, inference, final, rejected] = await Promise.all([
            db.collection("transactions_input")
              .find({ is_control_message: { $ne: true }, processed: false })
              .sort({ _id: -1 })
              .toArray(),
            db.collection("injected_events_queue")
              .find({ is_control_message: { $ne: true } })
              .sort({ _id: -1 })
              .toArray(),
            fetchRecent("transactions_bronze"),
            fetchRecent("transactions_silver"),
            fetchRecent("transactions_gold"),
            fetchRecent("inference_results"),
            db.collection("final_results")
              .find({})
              .sort({ aggregated_at: -1 })
              .toArray(),
            fetchRecent("transactions_rejected", false) // Show all rejected
          ]);

          const statusDoc = await db.collection("pipeline_status").findOne({ _id: "current" } as any);
          const isRunning = statusDoc ? statusDoc.status === "running" : false;
          const apiStatus = (statusDoc && statusDoc.api_is_up === false) ? "DOWN" : "UP";

          const rejectsCount = await db.collection("transactions_rejected").countDocuments();
          const humanReviewCount = await db.collection("final_results").countDocuments({ status: "TO_REVISE" });

          const nightlyDriftLevel = (statusDoc && statusDoc.drift_level !== undefined) ? statusDoc.drift_level : 0;

          const logs = await db.collection("pipeline_logs")
            .find()
            .sort({ _id: 1 })
            .toArray();

          const payload = JSON.stringify({
            input: [...injected_events, ...input_stream]
              .filter(doc => doc.is_control_message === undefined)
              .sort((a, b) => b._id.toString().localeCompare(a._id.toString())) // Safer sort for mixed ID types
              .slice(0, 50),
            bronze,
            silver,
            gold,
            inference,
            final,
            rejected,
            logs: logs, // Already in correct chronological order (oldest first)
            isRunning,
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
