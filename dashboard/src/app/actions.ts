"use server";

import clientPromise from "@/lib/db";
import { revalidatePath } from "next/cache";

const DB_NAME = "fraud_detection";
const FAULT_BURST_SIZE = 5;

export async function getDashboardMetrics() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  // Data Contract Rejects
  const rejectsCount = await db.collection("transactions_rejected").countDocuments();

  // API Status (Based on if an outage event exists and is not processed, or just check the last injected API status event)
  // The pipeline reads from `injected_events_queue`.
  // Alternatively, we can check the most recent event targeting 'silver_api' in the queue.
  // The pipeline consumes and deletes these events. If we want the status, we might just have to 
  // track it or if the queue is empty assume UP. 
  // For the dashboard, we can just say UP unless there's a recent outage event.
  // Wait, if the pipeline consumed it, it won't be in the queue.
  // Actually, we can check if there are many silver errors recently, but for simplicity let's mock the API status for now
  // or query the queue if it's pending.
  const lastApiEvent = await db.collection("injected_events_queue")
    .find({ target: "silver_api" })
    .sort({ _id: -1 })
    .limit(1)
    .next();
  const apiStatus = (lastApiEvent && lastApiEvent.is_down) ? "DOWN" : "UP";

  // Human Review Queue (Gold transactions flagged)
  const humanReviewCount = await db.collection("transactions_gold").countDocuments({ needs_manual_review: true });

  // Nightly Drift Level: Let's mock or calculate based on recent transactions_silver drift_score
  const recentSilver = await db.collection("transactions_silver")
    .find({ "ml_features.drift_score": { $exists: true } })
    .sort({ timestamp: -1 })
    .limit(100)
    .toArray();
    
  let driftSum = 0;
  let driftCount = 0;
  for (const doc of recentSilver) {
    if (doc.ml_features && typeof doc.ml_features.drift_score === 'number') {
        driftSum += doc.ml_features.drift_score;
        driftCount++;
    }
  }
  const avgDrift = driftCount > 0 ? (driftSum / driftCount) * 100 : 0; // percentage

  return {
    rejectsCount,
    apiStatus,
    humanReviewCount,
    nightlyDriftLevel: Math.round(avgDrift)
  };
}

export async function getRecentAlerts() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const rejected = await db.collection("transactions_rejected")
    .find()
    .sort({ _id: -1 }) // Assuming _id implies insertion order
    .limit(5)
    .toArray();

  const goldReview = await db.collection("transactions_gold")
    .find({ needs_manual_review: true })
    .sort({ _id: -1 })
    .limit(5)
    .toArray();

  // Combine and format
  const alerts = [
    ...rejected.map(r => ({ id: r.transaction_id || r._id.toString(), type: "Data Contract Reject", reason: r.rejection_reason || "Invalid schema", timestamp: r.timestamp || new Date().toISOString() })),
    ...goldReview.map(g => ({ id: g.transaction_id || g._id.toString(), type: "Fraud Rule Trigger", reason: "Flagged for review", timestamp: g.timestamp || new Date().toISOString() }))
  ];

  // Sort by timestamp desc
  alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return alerts.slice(0, 5);
}

export async function getHourlyDistribution() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  // A simplified distribution. In a real scenario we aggregate by timestamp hour.
  const silverDocs = await db.collection("transactions_silver").find().limit(500).toArray();
  const hours = Array.from({ length: 24 }, () => 0);
  
  silverDocs.forEach(doc => {
      if (doc.timestamp) {
          const date = new Date(doc.timestamp);
          if (!isNaN(date.getTime())) {
             hours[date.getHours()]++;
          }
      }
  });

  return hours.map((count, hour) => ({ name: `${hour}:00`, value: count }));
}

// Fault Injection Actions
export async function injectInvalidTx() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  // Sample 1 record from raw collection like fault_injector.py
  const rawRecords = await db.collection("transactions_raw").aggregate([{ $sample: { size: 1 } }]).toArray();
  if (rawRecords.length > 0) {
    const record = rawRecords[0];
    delete record._id; 
    record.transaction_id = `INJ-INVALID-Tx`;
    record.amount = -999.0;
    
    await db.collection("injected_events_queue").insertOne(record);
  }
  revalidatePath("/");
}

export async function injectNightlyBurst() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  // Sample FAULT_BURST_SIZE records and set time to 4 AM (14400s)
  const rawRecords = await db.collection("transactions_raw").aggregate([{ $sample: { size: FAULT_BURST_SIZE } }]).toArray();
  const driftRecords = rawRecords.map((record, i) => {
    delete record._id;
    return { 
      ...record, 
      transaction_id: `INJ-Night-bursts-${i + 1}`,
      time: 14400.0
    };
  });

  if (driftRecords.length > 0) {
    await db.collection("injected_events_queue").insertMany(driftRecords);
  }
  revalidatePath("/");
}

export async function toggleApiOutage() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection("injected_events_queue").insertOne({
      is_control_message: true,
      target: "silver_api",
      is_down: true
  });
  revalidatePath("/");
}

export async function toggleApiRecovery() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection("injected_events_queue").insertOne({
      is_control_message: true,
      target: "silver_api",
      is_down: false
  });
  revalidatePath("/");
}

export async function injectVelocityBurst() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  // Sample FAULT_BURST_SIZE records and set fixed time
  const rawRecords = await db.collection("transactions_raw").aggregate([{ $sample: { size: FAULT_BURST_SIZE } }]).toArray();
  const velocityRecords = rawRecords.map((record, i) => {
    delete record._id;
    return { 
      ...record, 
      transaction_id: `INJ-VELOCITY-bursts-${i + 1}`,
      time: 20000.0
    };
  });

  if (velocityRecords.length > 0) {
    await db.collection("injected_events_queue").insertMany(velocityRecords);
  }
  revalidatePath("/");
}

export async function resetPipeline() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await Promise.all([
      db.collection("transactions_bronze").deleteMany({}),
      db.collection("transactions_silver").deleteMany({}),
      db.collection("transactions_gold").deleteMany({}),
      db.collection("transactions_rejected").deleteMany({}),
      db.collection("injected_events_queue").deleteMany({}),
      db.collection("inference_results").deleteMany({}),
      db.collection("final_results").deleteMany({}),
      db.collection("pipeline_logs").deleteMany({})
  ]);
  revalidatePath("/");
}

export async function startPipeline() {
  const { spawn } = await import('child_process');
  const path = await import('path');
  
  // The python script is in ../src/pipeline/run.py relative to dashboard root
  const scriptPath = path.resolve(process.cwd(), '../src/pipeline/run.py');
  const venvPythonPath = path.resolve(process.cwd(), '../.venv/bin/python');
  const projectRoot = path.resolve(process.cwd(), '..');
  
  const child = spawn(venvPythonPath, [scriptPath, '--samples', '1', '--mode', 'demo'], {
    detached: true,
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { 
      ...process.env, 
      PYTHONPATH: projectRoot 
    }
  });
  
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  child.stdout?.on('data', async (data) => {
    const lines = data.toString().split('\n').filter((l: string) => l.trim());
    for (const line of lines) {
      await db.collection("pipeline_logs").insertOne({
        message: line,
        type: 'stdout',
        timestamp: new Date().toISOString()
      });
    }
  });

  child.stderr?.on('data', async (data) => {
    const lines = data.toString().split('\n').filter((l: string) => l.trim());
    for (const line of lines) {
      await db.collection("pipeline_logs").insertOne({
        message: line,
        type: 'stderr',
        timestamp: new Date().toISOString()
      });
    }
  });

  child.unref();
}

export async function getTransactionTimeDistributions() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  // Get a representative sample from silver layer
  const transactions = await db.collection("transactions_silver").find().limit(2000).toArray();
  
  if (transactions.length < 50) {
    // Fallback to pre-calculated distribution from CSV if DB is empty
    try {
      const staticData = await import("./time_distribution.json");
      return staticData.default || staticData;
    } catch (e) {
      console.error("Failed to load static distribution", e);
    }
  }

  const hours = new Array(24).fill(0);
  transactions.forEach(tx => {
    const timeVal = tx.time !== undefined ? tx.time : tx.Time;
    if (timeVal !== undefined && timeVal !== null) {
      const timeNum = typeof timeVal === 'string' ? parseFloat(timeVal) : timeVal;
      if (!isNaN(timeNum)) {
        const hour = Math.floor(timeNum / 3600) % 24;
        hours[hour]++;
      }
    }
  });
  
  return hours.map((count, hour) => ({ name: `${hour}:00`, value: count }));
}


