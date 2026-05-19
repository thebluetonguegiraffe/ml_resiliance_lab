"use client";

import { Activity, ShieldAlert, GitBranch, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header({ metrics }: { metrics?: any }) {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <header className="h-16 lg:h-20 shrink-0 bg-[#161721] border-b border-gray-800 flex items-center justify-between px-4 lg:px-8 z-50">
      <div className="flex items-center gap-4 lg:gap-12">
        <Link href="/" className="flex items-center gap-2 lg:gap-3 hover:opacity-80 transition-opacity">
          <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--primary)] shrink-0" />
          <h1 className="text-base lg:text-2xl font-black text-white tracking-tighter uppercase leading-none">
            ML RESILIENCE <span className="text-[var(--primary)]">LAB</span>
          </h1>
        </Link>

        <nav className="flex items-center gap-0.5 lg:gap-1 ml-1 lg:ml-4 bg-gray-950 p-0.5 lg:p-1 rounded-lg lg:rounded-xl border border-gray-800">
          <Link 
            href="/pipeline" 
            className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-md lg:rounded-lg text-xs lg:text-sm font-bold transition-all ${
              pathname.includes("/pipeline") 
                ? "bg-gray-800 text-white shadow-sm" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Pipeline
          </Link>
          <Link 
            href="/model" 
            className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-md lg:rounded-lg text-xs lg:text-sm font-bold transition-all ${
              pathname.includes("/model") 
                ? "bg-gray-800 text-white shadow-sm" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            ML Model
          </Link>
          <Link 
            href="/resilience" 
            className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-md lg:rounded-lg text-xs lg:text-sm font-bold transition-all ${
              pathname.includes("/resilience") 
                ? "bg-gray-800 text-white shadow-sm" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Resilience
          </Link>
        </nav>
      </div>
      
      {metrics && (
        <div id="tour-stats" className="flex items-center gap-3 md:gap-6 lg:gap-8">
          {/* Rejects Metric */}
          <div className="relative">
            <div 
              className="flex items-center gap-2 lg:gap-3"
              onMouseEnter={() => setHoveredTooltip('rejects')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <ShieldAlert className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--danger)] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] lg:text-[10px] text-gray-500 uppercase tracking-widest font-black">Rejects</span>
                <span className="text-base lg:text-xl font-black text-white leading-none">{metrics.rejectsCount}</span>
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

          <div className="w-px h-6 lg:h-8 bg-gray-800"></div>

          {/* API Status Metric */}
          <div className="relative">
            <div 
              className="flex items-center gap-2 lg:gap-3"
              onMouseEnter={() => setHoveredTooltip('api')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <Zap className={`w-5 h-5 lg:w-6 lg:h-6 shrink-0 ${metrics.apiStatus === "UP" ? "text-[var(--success)]" : "text-[var(--danger)]"}`} />
              <div className="flex flex-col">
                <span className="text-[8px] lg:text-[10px] text-gray-500 uppercase tracking-widest font-black">API Status</span>
                <span className={`text-base lg:text-xl font-black leading-none ${metrics.apiStatus === "UP" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
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

          <div className="w-px h-6 lg:h-8 bg-gray-800"></div>

          {/* Drift Metric */}
          <div className="relative">
            <div 
              className="flex items-center gap-2 lg:gap-3"
              onMouseEnter={() => setHoveredTooltip('drift')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <GitBranch className={`w-5 h-5 lg:w-6 lg:h-6 shrink-0 ${metrics.nightlyDriftLevel >= 100 ? "text-[var(--danger)] animate-pulse" : metrics.nightlyDriftLevel >= 50 ? "text-[var(--warning)]" : "text-[var(--primary)]"}`} />
              <div className="flex flex-col">
                <span className="text-[8px] lg:text-[10px] text-gray-500 uppercase tracking-widest font-black">Drift Level</span>
                <span className={`text-base lg:text-xl font-black leading-none ${metrics.nightlyDriftLevel >= 100 ? "text-[var(--danger)] animate-pulse" : metrics.nightlyDriftLevel >= 50 ? "text-[var(--warning)]" : "text-white"}`}>
                  {metrics.nightlyDriftLevel}%
                </span>
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

          <div className="w-px h-6 lg:h-8 bg-gray-800"></div>

          {/* Review Metric */}
          <div className="relative">
            <div 
              className="flex items-center gap-2 lg:gap-3"
              onMouseEnter={() => setHoveredTooltip('review')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--warning)] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] lg:text-[10px] text-gray-500 uppercase tracking-widest font-black">Review</span>
                <span className="text-base lg:text-xl font-black text-white leading-none">{metrics.humanReviewCount}</span>
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
