"use client";

import { AlertTriangle, TrendingUp, Power, Zap, RotateCcw, Play, Server, Bug, HelpCircle } from "lucide-react";
import { injectInvalidTx, injectNightlyBurst, toggleApiOutage, toggleApiRecovery, injectVelocityBurst, resetPipeline, startPipeline } from "@/app/actions";
import { useState } from "react";

export default function ControlPanel({ apiStatus }: { apiStatus: string }) {
  const isApiDown = apiStatus === "DOWN";
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggleApi = async () => {
    if (isApiDown) {
      await toggleApiRecovery();
    } else {
      await toggleApiOutage();
    }
  };

  const handleReset = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
      return;
    }
    await resetPipeline();
    setShowResetConfirm(false);
  };

  return (
    <div className="relative bg-[var(--background)] p-6 rounded-xl border border-gray-800 shadow-sm flex items-stretch gap-12">

      {/* Pipeline Lifecycle Menu */}
      <div className="flex flex-col flex-shrink-0 justify-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
          <Server className="text-[var(--success)]" size={24} />
          Pipeline Controls
        </h2>
        <div className="flex gap-4">
          <button
            onClick={async () => {
              await startPipeline();
            }}
            className="flex-1 flex items-center gap-2 px-4 py-2 bg-[var(--success)]/10 hover:bg-[var(--success)]/20 border border-[var(--success)]/30 rounded-lg transition-colors group justify-center"
            title="Start Pipeline"
          >
            <Play fill="currentColor" className="text-[var(--success)] group-hover:scale-110 transition-transform" size={16} />
            <span className="text-sm font-bold text-[var(--success)] whitespace-nowrap uppercase tracking-tight">Start Pipeline</span>
          </button>

          <button
            onClick={handleReset}
            className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 justify-center border ${showResetConfirm
                ? 'bg-[var(--danger)] text-white border-[var(--danger)] scale-105 shadow-lg shadow-[var(--danger)]/20'
                : 'bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 border-[var(--danger)]/30 text-[var(--danger)]'
              }`}
          >
            {showResetConfirm ? (
              <AlertTriangle size={16} className="animate-pulse" />
            ) : (
              <RotateCcw className="group-hover:-rotate-180 transition-transform duration-500" size={16} />
            )}
            <span className="text-sm font-bold whitespace-nowrap uppercase tracking-tight">
              {showResetConfirm ? 'Confirm Reset?' : 'Reset Pipeline'}
            </span>
          </button>
        </div>
      </div>

      <div className="w-px bg-gray-800 shrink-0"></div>

      {/* Fault Injection Section */}
      <div className="flex flex-col flex-1 justify-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
          <Bug className="text-[var(--warning)]" size={24} />
          Fault Injection Control
        </h2>

        <div className="flex gap-4">
          {/* Invalid Tx Panel */}
          <div className="relative flex-1">
            <button
              onClick={async () => await injectInvalidTx()}
              onMouseEnter={() => setHoveredTooltip('invalidTx')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <AlertTriangle className="text-[var(--danger)]" size={16} />
              <span className="text-sm font-bold text-gray-200 whitespace-nowrap uppercase tracking-tight">Invalid Tx</span>
            </button>
            {/* Popout Tooltip */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'invalidTx' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              {/* Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--danger)] rounded-t-xl opacity-50"></div>
              
              <p className="text-[11px] text-gray-200 font-medium leading-relaxed text-center">
                Injects a transaction with corrupted format to test rejection mechanisms in the Bronze layer.
              </p>
              
              {/* Arrow */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Nightly Burst Panel */}
          <div className="relative flex-1">
            <button
              onClick={async () => await injectNightlyBurst()}
              onMouseEnter={() => setHoveredTooltip('nightly')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <TrendingUp className="text-[var(--warning)]" size={16} />
              <span className="text-sm font-bold text-gray-200 whitespace-nowrap uppercase tracking-tight">Nightly Burst</span>
            </button>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'nightly' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--warning)] rounded-t-xl opacity-50"></div>
              <p className="text-[11px] text-gray-200 font-medium leading-relaxed text-center">
                Generates an unexpected burst of transactions outside normal hours to evaluate anomaly detection.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Toggle API Panel */}
          <div className="relative flex-1">
            <button
              onClick={handleToggleApi}
              onMouseEnter={() => setHoveredTooltip('api')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <Power className={`${isApiDown ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`} size={16} />
              <span className="text-sm font-bold text-gray-200 whitespace-nowrap uppercase tracking-tight">{isApiDown ? 'Recover API' : 'Kill API'}</span>
            </button>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'api' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${isApiDown ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'} rounded-t-xl opacity-50`}></div>
              <p className="text-[11px] text-gray-200 font-medium leading-relaxed text-center">
                {isApiDown 
                  ? 'Restores the external API connection to observe pipeline recovery.' 
                  : 'Simulates an external API failure to test fault tolerance.'}
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Velocity Burst Panel */}
          <div className="relative flex-1">
            <button
              onClick={async () => await injectVelocityBurst()}
              onMouseEnter={() => setHoveredTooltip('velocity')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <Zap className="text-[var(--primary)]" size={16} />
              <span className="text-sm font-bold text-gray-200 whitespace-nowrap uppercase tracking-tight">Velocity Burst</span>
            </button>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'velocity' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-t-xl opacity-50"></div>
              <p className="text-[11px] text-gray-200 font-medium leading-relaxed text-center">
                Fires bursts of transactions from a single user to test velocity validation rules.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-gray-700"></div>
            </div>
          </div>
        </div>
      </div>

    </div >
  );
}
