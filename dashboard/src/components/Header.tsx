import { Activity, ShieldAlert, GitBranch, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Header({ metrics }: { metrics?: any }) {
  return (
    <header className="h-16 shrink-0 bg-[var(--background)] border-b border-gray-800 flex items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Activity className="text-[var(--primary)]" size={24} />
        <h1 className="text-xl font-bold text-white tracking-tight">ML Resilience Lab</h1>
      </Link>
      
      {metrics && (
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-[var(--danger)]" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Rejects</span>
              <span className="text-lg font-bold text-white leading-none">{metrics.rejectsCount}</span>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-800"></div>

          <div className="flex items-center gap-3">
            <Zap size={20} className={metrics.apiStatus === "UP" ? "text-[var(--success)]" : "text-[var(--danger)]"} />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">API Status</span>
              <span className={`text-lg font-bold leading-none ${metrics.apiStatus === "UP" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                {metrics.apiStatus}
              </span>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-800"></div>

          <div className="flex items-center gap-3">
            <GitBranch size={20} className={metrics.nightlyDriftLevel > 25 ? "text-[var(--danger)]" : "text-[var(--primary)]"} />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Drift Level</span>
              <span className="text-lg font-bold text-white leading-none">{metrics.nightlyDriftLevel}%</span>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-800"></div>

          <div className="flex items-center gap-3">
            <Users size={20} className="text-[var(--warning)]" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Review Q</span>
              <span className="text-lg font-bold text-white leading-none">{metrics.humanReviewCount}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
