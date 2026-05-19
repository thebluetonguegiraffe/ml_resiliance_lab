"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import ControlPanel from "./ControlPanel";
import KanbanBoard from "./KanbanBoard";
import MetricsCard from "./MetricsCard";
import LogViewer from "./LogViewer";
import { ShieldAlert, GitBranch, Users, LayoutDashboard, Activity, X } from "lucide-react";
import GuidedTour from "./GuidedTour";
import { resetPipeline } from "@/app/actions";

export default function DashboardClient() {
  const [data, setData] = useState<{
    input: any[];
    bronze: any[];
    silver: any[];
    gold: any[];
    inference: any[];
    final: any[];
    rejected: any[];
    logs: any[];
    isRunning: boolean;
    metrics: {
      rejectsCount: number;
      apiStatus: string;
      humanReviewCount: number;
      nightlyDriftLevel: number;
    };
  }>({
    input: [],
    bronze: [],
    silver: [],
    gold: [],
    inference: [],
    final: [],
    rejected: [],
    logs: [],
    isRunning: false,
    metrics: {
      rejectsCount: 0,
      apiStatus: "UP",
      humanReviewCount: 0,
      nightlyDriftLevel: 0
    }
  });

  const [popups, setPopups] = useState<{ id: string; type: "warning" | "error"; title: string; message: string }[]>([]);
  const [notifiedLevels, setNotifiedLevels] = useState<Set<number>>(new Set());

  useEffect(() => {
    const drift = data.metrics.nightlyDriftLevel;
    if (drift === 0) {
      if (notifiedLevels.size > 0) {
        setNotifiedLevels(new Set());
      }
      return;
    }

    if (drift === 50 && !notifiedLevels.has(50)) {
      const id = Math.random().toString();
      setPopups(prev => [
        ...prev,
        {
          id,
          type: "warning",
          title: "Adversarial Drift: 50% Detected",
          message: "Moderate time bucket drift has been detected in the Silver Layer. Monitoring system is on alert (Yellow Indicator)."
        }
      ]);
      setNotifiedLevels(prev => {
        const next = new Set(prev);
        next.add(50);
        return next;
      });

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setPopups(prev => prev.filter(p => p.id !== id));
      }, 6000);
    }

    if (drift >= 100 && !notifiedLevels.has(100)) {
      const id = Math.random().toString();
      setPopups(prev => [
        ...prev,
        {
          id,
          type: "error",
          title: "Critical Drift: 100% (Halting Pipeline)",
          message: "Adversarial drift has reached 100%. The system Kill Switch has automatically tripped and processing has stopped."
        }
      ]);
      setNotifiedLevels(prev => {
        const next = new Set(prev);
        next.add(100);
        return next;
      });

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setPopups(prev => prev.filter(p => p.id !== id));
      }, 6000);
    }
  }, [data.metrics.nightlyDriftLevel, notifiedLevels]);

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
        <main className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6 xl:gap-8 w-full max-w-[1920px] mx-auto">

          {/* Pipeline Introduction */}
          <section className="bg-[#161721] p-4 md:p-6 lg:p-8 rounded-xl border border-gray-800 shadow-xl text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--primary)] mb-2 lg:mb-4 tracking-tighter uppercase">
              Pipeline <span className="text-white">Architecture</span>
            </h1>
            <p className="text-gray-400 text-xs lg:text-sm leading-relaxed text-justify w-full">
              This pipeline orchestrates a 4-stage data refinement process for fraud detection.
              <span className="text-[var(--primary)] font-bold"> Bronze</span> ingests raw events,
              <span className="text-[var(--primary)] font-bold"> Silver</span> enriches them with external APIs and ML features,
              <span className="text-[var(--primary)] font-bold"> Gold</span> applies business rules,
              and the <span className="text-[var(--primary)] font-bold"> Inference Layer</span> executes the pre-trained model for final decision-making.
              The system is architected to evaluate resilience against adversarial data drift, API instability, and schema contract violations in mission-critical environments.
            </p>
          </section>

          {/* Top Row: Control Panel (Protagonist) */}
          <div className="w-full">
            <ControlPanel apiStatus={data.metrics.apiStatus} isRunning={data.isRunning} />
          </div>

          {/* Pipeline Monitoring Section */}
          <div className="flex-1 flex flex-col mt-1 lg:mt-2">
            <h2 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-4 flex items-center gap-2 px-2">
              <LayoutDashboard className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--primary)]" />
              Pipeline Monitoring
            </h2>
            {/* Kanban Board Container */}
            <div id="tour-board" className="bg-[var(--background)] rounded-xl border border-gray-800 shadow-sm p-3 md:p-4 lg:p-6 h-[380px] md:h-[420px] lg:h-[500px] xl:h-[580px] 2xl:h-[650px]">
              <KanbanBoard data={data} />
            </div>

            {/* NEW: Log Viewer Section */}
            <div id="tour-logs">
              <LogViewer logs={data.logs} />
            </div>
          </div>

        </main>
        
        {/* Floating Glassmorphic Toasts Container */}
        <div className="fixed top-20 right-6 z-[99999] flex flex-col gap-3 w-80 sm:w-96 pointer-events-none">
          {popups.map(popup => (
            <div 
              key={popup.id} 
              className={`pointer-events-auto flex gap-3 p-4 rounded-xl border backdrop-blur-xl bg-gray-900/90 shadow-2xl transition-all duration-500 animate-slide-in-right ${
                popup.type === 'error' ? 'border-[var(--danger)]' : 'border-[var(--warning)]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {popup.type === 'error' ? (
                  <ShieldAlert className="w-5 h-5 text-[var(--danger)] animate-bounce" />
                ) : (
                  <GitBranch className="w-5 h-5 text-[var(--warning)] animate-pulse" />
                )}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {popup.title}
                </h4>
                <p className="text-[10px] text-gray-300 font-medium leading-relaxed">
                  {popup.message}
                </p>
              </div>
              <button 
                onClick={() => setPopups(prev => prev.filter(p => p.id !== popup.id))}
                className="text-gray-500 hover:text-white transition-colors text-xs self-start p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <GuidedTour />
      </div>
    </div>
  );
}
