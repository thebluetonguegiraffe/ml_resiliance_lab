"use client";

import { AlertTriangle, Power, Zap, RotateCcw, Play, Server, Bug, Moon, ShieldAlert } from "lucide-react";
import { injectInvalidTx, injectNightlyBurst, toggleApiOutage, toggleApiRecovery, injectVelocityBurst, resetPipeline, startPipeline, injectIncorrectSample } from "@/app/actions";
import { useState, useEffect } from "react";

export default function ControlPanel({ apiStatus, isRunning: serverIsRunning }: { apiStatus: string; isRunning?: boolean }) {
  const isApiDown = apiStatus === "DOWN";
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localIsRunning, setLocalIsRunning] = useState(false);

  const [selectedSamples, setSelectedSamples] = useState(10);
  const [selectedWorkers, setSelectedWorkers] = useState(1);

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
    <div id="tour-controls" className="relative bg-[#11131e]/85 backdrop-blur-md p-4 rounded-xl border border-gray-800/80 shadow-lg flex flex-col lg:flex-row items-stretch gap-6 w-full z-40">

      {/* Left Column: Pipeline Controls (Ultra-adaptive 2x2 grid layout) */}
      <div id="tour-pipeline-controls" className="flex flex-row gap-4 lg:w-[36%] xl:w-[33%] shrink-0 justify-between items-stretch">
        
        {/* Left Sub-column: Title and Buttons */}
        <div className="flex flex-col gap-3 justify-between flex-1">
          {/* Title */}
          <div className="flex items-center gap-2.5 shrink-0 min-h-[24px]">
            <Server className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--success)] shrink-0" />
            <span className="text-sm lg:text-base font-bold text-white uppercase tracking-wider whitespace-nowrap">Pipeline Controls</span>
          </div>
          
          {/* Start and Reset Buttons block (occupying full width of left sub-column) */}
          <div className="flex items-center gap-2 w-full">
            {/* Start Button */}
            <button
              onClick={async () => {
                if (isRunning) return;
                setLocalIsRunning(true);
                try {
                  await startPipeline(selectedSamples, selectedWorkers);
                } catch (err) {
                  console.error("Error launching pipeline:", err);
                  setLocalIsRunning(false);
                }
              }}
              disabled={isRunning}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 border rounded-lg text-[10px] lg:text-xs font-bold uppercase tracking-tight transition-all duration-300 group cursor-pointer disabled:cursor-not-allowed ${
                isRunning
                  ? "bg-gray-800/40 border-gray-700/50 text-gray-500"
                  : "bg-[var(--success)]/10 hover:bg-[var(--success)]/20 border border-[var(--success)]/30 text-[var(--success)]"
              }`}
              title={isRunning ? "Pipeline is running" : "Start Pipeline"}
            >
              {isRunning ? (
                <span className="flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--success)]"></span>
                  </span>
                  <span>Running</span>
                </span>
              ) : (
                <>
                  <Play fill="currentColor" className="w-3.5 h-3.5 text-[var(--success)] group-hover:scale-110 transition-transform" />
                  <span>Start</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 border rounded-lg text-[10px] lg:text-xs font-bold uppercase tracking-tight transition-all duration-300 shrink-0 cursor-pointer disabled:cursor-not-allowed ${showResetConfirm
                  ? 'bg-[var(--danger)] text-white border-[var(--danger)] scale-105 shadow-md shadow-[var(--danger)]/20'
                  : 'bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 border-[var(--danger)]/30 text-[var(--danger)]'
                }`}
            >
              {showResetConfirm ? (
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500 shrink-0" />
              )}
              <span className="shrink-0">
                {showResetConfirm ? 'Confirm?' : 'Reset'}
              </span>
            </button>
          </div>
        </div>

        {/* Symmetrical vertical divider inside left column */}
        <div className="hidden sm:block w-px bg-gray-800/80 self-stretch shrink-0 my-1"></div>

        {/* Right Sub-column: Selectors (Stacked vertically to occupy upper/lower row beautifully) */}
        <div className="flex flex-col justify-between shrink-0 select-none pb-0.5">
          {/* Samples Selector */}
          <div className="relative shrink-0">
            <div 
              className="flex items-center gap-1.5 cursor-pointer bg-[#0d0e15] py-1.5 px-2 rounded-lg border border-gray-800/80 text-[10px] lg:text-xs"
              onMouseEnter={() => setHoveredTooltip('samples')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <span className="font-bold text-gray-400">Samples:</span>
              <div className="flex bg-[#12131a] p-0.5 rounded border border-gray-800/80">
                {[1, 10, 100].map((s) => (
                  <button
                    key={s}
                    disabled={isRunning}
                    onClick={() => setSelectedSamples(s)}
                    className={`px-1.5 py-0.5 text-[9px] lg:text-[10px] font-bold rounded transition-all duration-300 cursor-pointer ${
                      selectedSamples === s
                        ? "bg-[var(--success)]/20 text-[var(--success)] shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Premium Tooltip */}
            <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 w-44 p-2.5 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-50 pointer-events-none ${
              hoveredTooltip === 'samples' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-t-xl opacity-60"></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Number of test transactions to inject into pipeline.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Workers Selector */}
          <div className="relative shrink-0">
            <div 
              className="flex items-center gap-1.5 cursor-pointer bg-[#0d0e15] py-1.5 px-2 rounded-lg border border-gray-800/80 text-[10px] lg:text-xs"
              onMouseEnter={() => setHoveredTooltip('workers')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <span className="font-bold text-gray-400">Workers:</span>
              <div className="flex bg-[#12131a] p-0.5 rounded border border-gray-800/80">
                {[1, 2, 4].map((w) => (
                  <button
                    key={w}
                    disabled={isRunning}
                    onClick={() => setSelectedWorkers(w)}
                    className={`px-1.5 py-0.5 text-[9px] lg:text-[10px] font-bold rounded transition-all duration-300 cursor-pointer ${
                      selectedWorkers === w
                        ? "bg-[var(--success)]/20 text-[var(--success)] shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            {/* Premium Tooltip */}
            <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 w-44 p-2.5 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-50 pointer-events-none ${
              hoveredTooltip === 'workers' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-t-xl opacity-60"></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Number of parallel processor workers to spawn.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Standalone Vertical Divider (Clean vertical line separating left/right completely) */}
      <div className="hidden lg:block w-px bg-gray-800/80 self-stretch shrink-0 mx-1"></div>

      {/* Right Column: Fault Injection Control */}
      <div id="tour-fault-controls" className="flex-1 flex flex-col gap-3 justify-between pl-2 lg:pl-0">
        {/* Row 1: Right Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Bug className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--warning)]" />
          <span className="text-sm lg:text-base font-bold text-white uppercase tracking-wider">Fault Injection Control</span>
        </div>

        {/* Row 2: Injections (All in one line) */}
        <div className="flex items-center gap-2.5 w-full">
          {/* Invalid Tx Panel */}
          <div className="relative flex-1 flex">
            <button
              onClick={async () => await injectInvalidTx()}
              onMouseEnter={() => setHoveredTooltip('invalidTx')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl transition-all duration-300 shadow-md cursor-pointer text-[10px] lg:text-xs font-bold uppercase whitespace-nowrap w-full"
            >
              <AlertTriangle className="text-[var(--danger)] w-4.5 h-4.5 fill-[var(--danger)]/10 shrink-0" />
              <span>Invalid Tx</span>
            </button>
            {/* Premium Tooltip */}
            <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 w-52 p-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-50 pointer-events-none ${
              hoveredTooltip === 'invalidTx' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--danger)] rounded-t-xl opacity-60"></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Injects a raw transaction with negative/corrupted timestamp to test schema validation rules.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Fraud Sample Panel */}
          <div className="relative flex-1 flex">
            <button
              onClick={async () => await injectIncorrectSample()}
              onMouseEnter={() => setHoveredTooltip('incorrectSample')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 hover:border-gray-650 rounded-xl transition-all duration-300 shadow-md cursor-pointer text-[10px] lg:text-xs font-bold uppercase whitespace-nowrap w-full"
            >
              <ShieldAlert className="text-red-500 w-4.5 h-4.5 fill-red-500/10 shrink-0" />
              <span>Fraud Sample</span>
            </button>
            {/* Premium Tooltip */}
            <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 w-52 p-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-50 pointer-events-none ${
              hoveredTooltip === 'incorrectSample' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--danger)] rounded-t-xl opacity-60"></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Injects an actual known fraudulent transaction (Class 1) from raw collections.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Nightly Drift Panel */}
          <div className="relative flex-1 flex">
            <button
              onClick={async () => await injectNightlyBurst()}
              onMouseEnter={() => setHoveredTooltip('nightly')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 hover:border-gray-650 rounded-xl transition-all duration-300 shadow-md cursor-pointer text-[10px] lg:text-xs font-bold uppercase whitespace-nowrap w-full"
            >
              <Moon className="text-[var(--warning)] w-4.5 h-4.5 fill-[var(--warning)]/10 shrink-0" />
              <span>Nightly Burst</span>
            </button>
            {/* Premium Tooltip */}
            <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 w-52 p-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-50 pointer-events-none ${
              hoveredTooltip === 'nightly' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--warning)] rounded-t-xl opacity-60"></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Simulates a high volume spike in nighttime transactions to test concept drift.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Toggle API Panel */}
          <div className="relative flex-1 flex">
            <button
              onClick={handleToggleApi}
              onMouseEnter={() => setHoveredTooltip('api')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 hover:border-gray-650 rounded-xl transition-all duration-300 shadow-md cursor-pointer text-[10px] lg:text-xs font-bold uppercase whitespace-nowrap w-full"
            >
              <Power className={`${isApiDown ? 'text-[var(--success)]' : 'text-[var(--danger)]'} w-4.5 h-4.5 shrink-0`} />
              <span>{isApiDown ? 'Recover API' : 'Kill API'}</span>
            </button>
            {/* Premium Tooltip */}
            <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 w-52 p-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-50 pointer-events-none ${
              hoveredTooltip === 'api' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${isApiDown ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'} rounded-t-xl opacity-60`}></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                {isApiDown ? "Recovers the downstream ML scoring API back to normal operations." : "Simulates an outage of the downstream ML scoring API to trigger the circuit breaker."}
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>

          {/* Velocity Burst Panel */}
          <div className="relative flex-1 flex">
            <button
              onClick={async () => await injectVelocityBurst()}
              onMouseEnter={() => setHoveredTooltip('velocity')}
              onMouseLeave={() => setHoveredTooltip(null)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-2 bg-[#171821] hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl transition-all duration-300 shadow-md cursor-pointer text-[10px] lg:text-xs font-bold uppercase whitespace-nowrap w-full"
            >
              <Zap className="text-blue-400 w-4.5 h-4.5 fill-blue-400/10 shrink-0" />
              <span>Velocity Burst</span>
            </button>
            {/* Premium Tooltip */}
            <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 w-52 p-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl transition-all duration-300 z-50 pointer-events-none ${
              hoveredTooltip === 'velocity' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-xl opacity-60"></div>
              <p className="text-[10px] text-gray-200 font-medium leading-relaxed text-center">
                Triggers a high frequency transaction burst (&gt;10 tx/s) for a single cardholder.
              </p>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-700"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
