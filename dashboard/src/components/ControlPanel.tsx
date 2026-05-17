"use client";

import { AlertTriangle, TrendingUp, Power, Zap, RotateCcw, Play, Server, Bug, HelpCircle } from "lucide-react";
import { injectInvalidTx, injectNightlyBurst, toggleApiOutage, toggleApiRecovery, injectVelocityBurst, resetPipeline, startPipeline } from "@/app/actions";
import { useState, useEffect } from "react";

export default function ControlPanel({ apiStatus, isRunning: serverIsRunning }: { apiStatus: string; isRunning?: boolean }) {
  const isApiDown = apiStatus === "DOWN";
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localIsRunning, setLocalIsRunning] = useState(false);

  const isRunning = !!(serverIsRunning || localIsRunning);

  useEffect(() => {
    if (serverIsRunning !== undefined) {
      setLocalIsRunning(serverIsRunning);
    }
  }, [serverIsRunning]);

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
    <div id="tour-controls" className="relative bg-[var(--background)] p-4 lg:p-6 rounded-xl border border-gray-800 shadow-sm flex flex-col md:flex-row items-stretch gap-6 lg:gap-12">

      {/* Pipeline Lifecycle Menu */}
      <div className="flex flex-col flex-shrink-0 justify-center">
        <h2 className="text-base lg:text-lg xl:text-xl font-bold text-white flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
          <Server className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--success)]" />
          Pipeline Controls
        </h2>
        <div className="flex gap-3 lg:gap-4">
          <button
            onClick={async () => {
              if (isRunning) return;
              setLocalIsRunning(true);
              try {
                await startPipeline();
              } catch (err) {
                console.error("Error launching pipeline:", err);
                setLocalIsRunning(false);
              }
            }}
            disabled={isRunning}
            className={`min-w-[140px] lg:min-w-[160px] flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2 border rounded-lg transition-all duration-300 group justify-center ${
              isRunning
                ? "bg-gray-800/40 border-gray-700/50 text-gray-500 cursor-not-allowed"
                : "bg-[var(--success)]/10 hover:bg-[var(--success)]/20 border border-[var(--success)]/30 text-[var(--success)]"
            }`}
            title={isRunning ? "Pipeline is running" : "Start Pipeline"}
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
                </span>
                <span className="text-xs lg:text-sm font-bold text-gray-400 whitespace-nowrap uppercase tracking-tight">Running...</span>
              </span>
            ) : (
              <>
                <Play fill="currentColor" className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[var(--success)] group-hover:scale-110 transition-transform" />
                <span className="text-xs lg:text-sm font-bold whitespace-nowrap uppercase tracking-tight">Start Pipeline</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className={`flex-1 flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg transition-all duration-300 justify-center border ${showResetConfirm
                ? 'bg-[var(--danger)] text-white border-[var(--danger)] scale-105 shadow-lg shadow-[var(--danger)]/20'
                : 'bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 border-[var(--danger)]/30 text-[var(--danger)]'
              }`}
          >
            {showResetConfirm ? (
              <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4 animate-pulse" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:-rotate-180 transition-transform duration-500" />
            )}
            <span className="text-xs lg:text-sm font-bold whitespace-nowrap uppercase tracking-tight">
              {showResetConfirm ? 'Confirm Reset?' : 'Reset Pipeline'}
            </span>
          </button>
        </div>
      </div>

      <div className="hidden md:block w-px bg-gray-800 shrink-0"></div>

      {/* Fault Injection Section */}
      <div className="flex flex-col flex-1 justify-center">
        <h2 className="text-base lg:text-lg xl:text-xl font-bold text-white flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
          <Bug className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--warning)]" />
          Fault Injection Control
        </h2>

        <div className="flex flex-wrap lg:flex-nowrap gap-3 lg:gap-4">
          {/* Invalid Tx Panel */}
          <div className="relative flex-1 min-w-[120px]">
            <button
              onClick={async () => await injectInvalidTx()}
              onMouseEnter={() => setHoveredTooltip('invalidTx')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="w-full flex items-center justify-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <AlertTriangle className="text-[var(--danger)] w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-sm font-bold text-gray-200 whitespace-nowrap uppercase tracking-tight">Invalid Tx</span>
            </button>
            {/* Popout Tooltip */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 lg:w-64 p-3 lg:p-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'invalidTx' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              {/* Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--danger)] rounded-t-xl opacity-50"></div>
              
              <p className="text-[10px] lg:text-[11px] text-gray-200 font-medium leading-relaxed text-center">
                Injects a transaction with corrupted format to test rejection mechanisms in the Bronze layer.
              </p>
              
              {/* Arrow */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Nightly Burst Panel */}
          <div className="relative flex-1 min-w-[120px]">
            <button
              onClick={async () => await injectNightlyBurst()}
              onMouseEnter={() => setHoveredTooltip('nightly')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="w-full flex items-center justify-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <TrendingUp className="text-[var(--warning)] w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-sm font-bold text-gray-200 whitespace-nowrap uppercase tracking-tight">Nightly Burst</span>
            </button>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 lg:w-64 p-3 lg:p-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'nightly' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--warning)] rounded-t-xl opacity-50"></div>
              <p className="text-[10px] lg:text-[11px] text-gray-200 font-medium leading-relaxed text-center">
                Generates an unexpected burst of transactions outside normal hours to evaluate anomaly detection.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Toggle API Panel */}
          <div className="relative flex-1 min-w-[120px]">
            <button
              onClick={handleToggleApi}
              onMouseEnter={() => setHoveredTooltip('api')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="w-full flex items-center justify-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <Power className={`${isApiDown ? 'text-[var(--success)]' : 'text-[var(--danger)]'} w-3.5 h-3.5 lg:w-4 lg:h-4`} />
              <span className="text-xs lg:text-sm font-bold text-gray-200 whitespace-nowrap uppercase tracking-tight">{isApiDown ? 'Recover API' : 'Kill API'}</span>
            </button>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 lg:w-64 p-3 lg:p-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'api' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${isApiDown ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'} rounded-t-xl opacity-50`}></div>
              <p className="text-[10px] lg:text-[11px] text-gray-200 font-medium leading-relaxed text-center">
                {isApiDown 
                  ? 'Restores the external API connection to observe pipeline recovery.' 
                  : 'Simulates an external API failure to test fault tolerance.'}
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Velocity Burst Panel */}
          <div className="relative flex-1 min-w-[120px]">
            <button
              onClick={async () => await injectVelocityBurst()}
              onMouseEnter={() => setHoveredTooltip('velocity')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="w-full flex items-center justify-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <Zap className="text-[var(--primary)] w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-sm font-bold text-gray-200 whitespace-nowrap uppercase tracking-tight">Velocity Burst</span>
            </button>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 lg:w-64 p-3 lg:p-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 z-[9999] pointer-events-none ${
              hoveredTooltip === 'velocity' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-t-xl opacity-50"></div>
              <p className="text-[10px] lg:text-[11px] text-gray-200 font-medium leading-relaxed text-center">
                Fires bursts of transactions from a single user to test velocity validation rules.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-gray-700"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
