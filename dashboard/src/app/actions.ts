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


  // API Status (Based on the persistent api_is_up field in pipeline_status collection)
  const statusDoc = await db.collection("pipeline_status").findOne({ _id: "current" } as any);
  const apiStatus = (statusDoc && statusDoc.api_is_up === false) ? "DOWN" : "UP";

  // Human Review Queue (Gold transactions flagged)
  const humanReviewCount = await db.collection("final_results").countDocuments({ status: "TO_REVISE" });

  // Nightly Drift Level: fetched directly from pipeline status
  const nightlyDriftLevel = (statusDoc && statusDoc.drift_level !== undefined) ? statusDoc.drift_level : 0;

  return {
    rejectsCount,
    apiStatus,
    humanReviewCount,
    nightlyDriftLevel
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

  const goldReview = await db.collection("final_results")
    .find({ status: "TO_REVISE" })
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

  const statusDoc = await db.collection("pipeline_status").findOne({ _id: "current" } as any);
  const currentCounter = (statusDoc && statusDoc.injected_counter !== undefined) ? statusDoc.injected_counter : 0;

  // Sample 1 record from raw collection like fault_injector.py
  const rawRecords = await db.collection("transactions_raw").aggregate([{ $sample: { size: 1 } }]).toArray();
  if (rawRecords.length > 0) {
    const record = rawRecords[0];
    delete record._id;
    delete record.transaction_id;
    record.internal_id = `INJ-${currentCounter + 1}-INVALID`;
    record.amount = -999.0;

    await db.collection("injected_events_queue").insertOne(record);
    await db.collection("pipeline_status").updateOne(
      { _id: "current" } as any,
      { $inc: { injected_counter: 1 } }
    );
  }
  revalidatePath("/");
}

export async function injectNightlyBurst() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  const statusDoc = await db.collection("pipeline_status").findOne({ _id: "current" } as any);
  const currentCounter = (statusDoc && statusDoc.injected_counter !== undefined) ? statusDoc.injected_counter : 0;

  const rawRecords = await db.collection("transactions_raw").aggregate([{ $sample: { size: FAULT_BURST_SIZE-1 } }]).toArray();
  const driftRecords = rawRecords.map((record, i) => {
    delete record._id;
    delete record.transaction_id;
    
    const randomTime = Math.floor(Math.random() * (18000 - 14400 + 1)) + 14400;

    return {
      ...record,
      internal_id: `INJ-${currentCounter + i + 1}-NIGHT`,
      time: parseFloat(randomTime.toFixed(1))
    };
  });

  if (driftRecords.length > 0) {
    await db.collection("injected_events_queue").insertMany(driftRecords);
    await db.collection("pipeline_status").updateOne(
      { _id: "current" } as any,
      { $inc: { injected_counter: FAULT_BURST_SIZE-1 } }
    );
  }
  revalidatePath("/");
}

export async function toggleApiOutage() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection("pipeline_status").updateOne(
    { _id: "current" } as any,
    { $set: { api_is_up: false } },
    { upsert: true }
  );
  revalidatePath("/");
}

export async function toggleApiRecovery() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection("pipeline_status").updateOne(
    { _id: "current" } as any,
    { $set: { api_is_up: true } },
    { upsert: true }
  );
  revalidatePath("/");
}

export async function injectVelocityBurst() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const statusDoc = await db.collection("pipeline_status").findOne({ _id: "current" } as any);
  const currentCounter = (statusDoc && statusDoc.injected_counter !== undefined) ? statusDoc.injected_counter : 0;

  // Sample FAULT_BURST_SIZE records and set fixed time
  const rawRecords = await db.collection("transactions_raw").aggregate([{ $sample: { size: FAULT_BURST_SIZE } }]).toArray();
  const velocityRecords = rawRecords.map((record, i) => {
    delete record._id;
    delete record.transaction_id;
    return {
      ...record,
      internal_id: `INJ-${currentCounter + i + 1}-VELOCITY`,
      time: 20000.0
    };
  });

  if (velocityRecords.length > 0) {
    await db.collection("injected_events_queue").insertMany(velocityRecords);
    await db.collection("pipeline_status").updateOne(
      { _id: "current" } as any,
      { $inc: { injected_counter: FAULT_BURST_SIZE } }
    );
  }
  revalidatePath("/");
}

export async function injectIncorrectSample() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const statusDoc = await db.collection("pipeline_status").findOne({ _id: "current" } as any);
  const currentCounter = (statusDoc && statusDoc.injected_counter !== undefined) ? statusDoc.injected_counter : 0;

  // query the raw transactions collection for a document where class: 1
  const rawRecords = await db.collection("transactions_raw").find({ class: 1 }).limit(1).toArray();
  if (rawRecords.length > 0) {
    const record = rawRecords[0];
    delete (record as any)._id;
    delete (record as any).transaction_id;
    (record as any).internal_id = `INJ-${currentCounter + 1}-FRAUD`;

    await db.collection("injected_events_queue").insertOne(record);
    await db.collection("pipeline_status").updateOne(
      { _id: "current" } as any,
      { $inc: { injected_counter: 1 } }
    );
  }
  revalidatePath("/");
}

export async function resetPipeline() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await Promise.all([
    db.collection("transactions_input").deleteMany({}),
    db.collection("transactions_bronze").deleteMany({}),
    db.collection("transactions_silver").deleteMany({}),
    db.collection("transactions_gold").deleteMany({}),
    db.collection("transactions_rejected").deleteMany({}),
    db.collection("injected_events_queue").deleteMany({}),
    db.collection("inference_results").deleteMany({}),
    db.collection("final_results").deleteMany({}),
    db.collection("pipeline_logs").deleteMany({}),
    db.collection("pipeline_status").updateOne(
      { _id: "current" } as any,
      { $set: { status: "idle", api_is_up: true, updatedAt: new Date(), injected_counter: 0 } },
      { upsert: true }
    )
  ]);
  revalidatePath("/");
}

export async function startPipeline(samples: number = 10, workers: number = 1) {
  const { spawn } = await import('child_process');
  const path = await import('path');

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  // Clear all collections so the board & logs appear empty before the new run
  await Promise.all([
    db.collection("transactions_input").deleteMany({}),
    db.collection("transactions_bronze").deleteMany({}),
    db.collection("transactions_silver").deleteMany({}),
    db.collection("transactions_gold").deleteMany({}),
    db.collection("transactions_rejected").deleteMany({}),
    db.collection("inference_results").deleteMany({}),
    db.collection("final_results").deleteMany({}),
    db.collection("pipeline_logs").deleteMany({}),
  ]);

  // Set status to running
  await db.collection("pipeline_status").updateOne(
    { _id: "current" } as any,
    { $set: { status: "running", startedAt: new Date(), injected_counter: 0 } },
    { upsert: true }
  );

  // The python script is in ../src/pipeline/run.py relative to dashboard root
  const scriptPath = path.resolve(process.cwd(), '../src/pipeline/run.py');
  const venvPythonPath = path.resolve(process.cwd(), '../.venv/bin/python');
  const projectRoot = path.resolve(process.cwd(), '..');

  const child = spawn(venvPythonPath, ['-u', scriptPath, '--samples', String(samples), '--workers', String(workers), '--mode', 'demo'], {
    detached: true,
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PYTHONUNBUFFERED: "1",
      PYTHONPATH: projectRoot
    }
  });

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

  // Track termination/closing of process to set status back to idle
  child.on('close', async (code) => {
    try {
      const internalClient = await clientPromise;
      const internalDb = internalClient.db(DB_NAME);
      await internalDb.collection("pipeline_status").updateOne(
        { _id: "current" } as any,
        { $set: { status: "idle", updatedAt: new Date(), exitCode: code } },
        { upsert: true }
      );
    } catch (err) {
      console.error("Error setting status to idle in close handler:", err);
    }
  });

  child.on('error', async (err) => {
    try {
      const internalClient = await clientPromise;
      const internalDb = internalClient.db(DB_NAME);
      await internalDb.collection("pipeline_status").updateOne(
        { _id: "current" } as any,
        { $set: { status: "idle", updatedAt: new Date(), error: err.message } },
        { upsert: true }
      );
    } catch (dbErr) {
      console.error("Error setting status to idle in error handler:", dbErr);
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


