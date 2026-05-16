"use client";

import { Activity, ShieldAlert, GitBranch, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header({ metrics }: { metrics?: any }) {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <header className="h-20 shrink-0 bg-[#161721] border-b border-gray-800 flex items-center justify-between px-8 z-50">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Activity className="text-[var(--primary)]" size={32} />
          <h1 className="text-2xl font-bold text-white tracking-tighter uppercase">
            ML Resilience <span className="text-[var(--primary)]">Lab</span>
          </h1>
        </Link>

        <nav className="flex items-center gap-1 ml-4 bg-gray-950 p-1 rounded-xl border border-gray-800">
          <Link 
            href="/pipeline" 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              pathname.includes("/pipeline") 
                ? "bg-gray-800 text-white shadow-sm" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Pipeline
          </Link>
          <Link 
            href="/model" 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              pathname.includes("/model") 
                ? "bg-gray-800 text-white shadow-sm" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            ML Model
          </Link>
        </nav>
      </div>
      
      {metrics && (
        <div id="tour-stats" className="flex items-center gap-8">
          {/* Rejects Metric */}
          <div className="relative">
            <div 
              className="flex items-center gap-3"
              onMouseEnter={() => setHoveredTooltip('rejects')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <ShieldAlert size={24} className="text-[var(--danger)]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Rejects</span>
                <span className="text-xl font-black text-white leading-none">{metrics.rejectsCount}</span>
              </div>
            </div>
            {/* Custom Tooltip */}
            <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 p-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'rejects' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--danger)] rounded-t-xl opacity-50"></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Total transactions blocked by data contract and security rules.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-800"></div>

          {/* API Status Metric */}
          <div className="relative">
            <div 
              className="flex items-center gap-3"
              onMouseEnter={() => setHoveredTooltip('api')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <Zap size={24} className={metrics.apiStatus === "UP" ? "text-[var(--success)]" : "text-[var(--danger)]"} />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">API Status</span>
                <span className={`text-xl font-black leading-none ${metrics.apiStatus === "UP" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {metrics.apiStatus}
                </span>
              </div>
            </div>
            <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 p-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'api' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${metrics.apiStatus === "UP" ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'} rounded-t-xl opacity-50`}></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Real-time health status of the Silver Layer Enrichment API.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-800"></div>

          {/* Drift Metric */}
          <div className="relative">
            <div 
              className="flex items-center gap-3"
              onMouseEnter={() => setHoveredTooltip('drift')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <GitBranch size={24} className={metrics.nightlyDriftLevel > 25 ? "text-[var(--danger)]" : "text-[var(--primary)]"} />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Drift Level</span>
                <span className="text-xl font-black text-white leading-none">{metrics.nightlyDriftLevel}%</span>
              </div>
            </div>
            <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 p-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'drift' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-t-xl opacity-50"></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Statistical deviation detected in the 4 AM nightly window.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-800"></div>

          {/* Review Metric */}
          <div className="relative">
            <div 
              className="flex items-center gap-3"
              onMouseEnter={() => setHoveredTooltip('review')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <Users size={24} className="text-[var(--warning)]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Review Q</span>
                <span className="text-xl font-black text-white leading-none">{metrics.humanReviewCount}</span>
              </div>
            </div>
            <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 p-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'review' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--warning)] rounded-t-xl opacity-50"></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Inconclusive transactions pending human analyst intervention.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
