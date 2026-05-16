"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import ControlPanel from "./ControlPanel";
import KanbanBoard from "./KanbanBoard";
import MetricsCard from "./MetricsCard";
import LogViewer from "./LogViewer";
import { ShieldAlert, GitBranch, Users, LayoutDashboard, Activity } from "lucide-react";

export default function DashboardClient() {
  const [data, setData] = useState({
    input: [],
    bronze: [],
    silver: [],
    gold: [],
    inference: [],
    final: [],
    rejected: [],
    logs: [],
    metrics: {
      rejectsCount: 0,
      apiStatus: "UP",
      humanReviewCount: 0,
      nightlyDriftLevel: 0
    }
  });

  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (err) {
        console.error("Error parsing SSE data", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f111a] text-[var(--foreground)] font-sans">
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <Header metrics={data.metrics} />
        <main className="flex-1 p-6 flex flex-col gap-8 w-full max-w-[1920px] mx-auto">
          
          {/* Pipeline Introduction */}
          <section className="bg-[#161721] p-8 rounded-xl border border-gray-800 shadow-xl text-left">
            <h1 className="text-4xl font-bold text-[var(--primary)] mb-4 tracking-tighter uppercase">
              Pipeline <span className="text-white">Architecture</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed text-justify w-full mb-8">
              This pipeline orchestrates a 4-stage data refinement process for fraud detection. 
              <span className="text-[var(--primary)] font-bold"> Bronze</span> ingests raw events, 
              <span className="text-[var(--primary)] font-bold"> Silver</span> enriches them with external APIs and ML features, 
              <span className="text-[var(--primary)] font-bold"> Gold</span> applies business rules, 
              and the <span className="text-[var(--primary)] font-bold"> Inference Layer</span> executes the pre-trained model for final decision-making. 
              The system is architected to evaluate resilience against adversarial data drift, API instability, and schema contract violations in mission-critical environments.
            </p>

            {/* Quick Start Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-800/50 mt-4">
              <div className="flex flex-col gap-3 p-5 bg-gray-950/40 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)] font-black text-xs border border-[var(--success)]/20">1</div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Start Ingestion</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Use the <span className="text-[var(--success)] font-bold italic">PIPELINE CONTROLS</span> to initiate the stream. This activates the producer and starts processing the raw dataset.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-gray-900/40 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-xs border border-[var(--primary)]/20">2</div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Monitor Traffic</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Watch the <span className="text-[var(--primary)] font-bold italic">LIVE ACTIVITY</span> panel. Transactions will flow through validation stages in sub-second cycles.
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-gray-950/40 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--warning)]/10 flex items-center justify-center text-[var(--warning)] font-black text-xs border border-[var(--warning)]/20">3</div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Simulate Failure</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Trigger <span className="text-[var(--warning)] font-bold italic">FAULT INJECTIONS</span> to observe how the pipeline handles outages or adversarial data drift.
                </p>
              </div>
            </div>
          </section>

          {/* Top Row: Control Panel (Protagonist) */}
          <div className="w-full">
            <ControlPanel apiStatus={data.metrics.apiStatus} />
          </div>

          {/* Pipeline Monitoring Section */}
          <div className="flex-1 flex flex-col mt-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 px-2">
              <LayoutDashboard className="text-[var(--primary)]" size={24} />
              Pipeline Monitoring
            </h2>
            {/* Kanban Board Container */}
            <div className="bg-[var(--background)] rounded-xl border border-gray-800 shadow-sm p-6 min-h-[600px]">
              <KanbanBoard data={data} />
            </div>

            {/* NEW: Log Viewer Section */}
            <LogViewer logs={data.logs} />
          </div>
          
        </main>
      </div>
    </div>
  );
}
