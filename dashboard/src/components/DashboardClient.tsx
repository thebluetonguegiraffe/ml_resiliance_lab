"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import ControlPanel from "./ControlPanel";
import KanbanBoard from "./KanbanBoard";
import MetricsCard from "./MetricsCard";
import LogViewer from "./LogViewer";
import { ShieldAlert, GitBranch, Users, LayoutDashboard } from "lucide-react";

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
