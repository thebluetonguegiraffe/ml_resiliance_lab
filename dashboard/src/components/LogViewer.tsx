"use client";

import { Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LogEntry {
  _id: string;
  message: string;
  type: 'stdout' | 'stderr';
  timestamp: string;
}

export default function LogViewer({ logs }: { logs: LogEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevLogsLength = useRef(logs.length);

  // Scroll to bottom when new logs arrive, ONLY if the user was already at the bottom
  useEffect(() => {
    if (isAtBottom && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, isAtBottom]);

  // Force scroll to bottom when transitioning from 0 to some logs (e.g. after start/reset)
  useEffect(() => {
    if (prevLogsLength.current === 0 && logs.length > 0) {
      setIsAtBottom(true);
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
    prevLogsLength.current = logs.length;
  }, [logs]);

  // Monitor scroll action to check if the user has scrolled up to see older logs
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Allow a high margin of error (100px) to absorb browser zooms, subpixel rendering, and viewport scaling
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
  };

  return (
    <div className="mt-4 lg:mt-8 flex flex-col gap-2 lg:gap-4">
      <div className="flex items-center gap-2 px-2">
        <Terminal className="text-[var(--primary)] w-4 h-4 lg:w-5 lg:h-5" />
        <h2 className="text-sm lg:text-lg font-bold text-white">Pipeline Execution Logs</h2>
      </div>

      <div className="bg-[#0b0c14] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="bg-gray-900/50 px-3 lg:px-4 py-1.5 lg:py-2 border-b border-gray-800 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-green-500/50"></div>
          </div>
          <span className="text-[8px] lg:text-[10px] font-mono text-gray-500 uppercase tracking-widest">bash — python3 run.py</span>
        </div>

        {/* Content */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="p-3 lg:p-4 font-mono text-[10px] lg:text-xs overflow-y-auto h-[150px] md:h-[220px] lg:h-[300px] flex flex-col gap-1 custom-scrollbar"
        >
          {logs.length === 0 ? (
            <div className="text-gray-600 italic py-4 text-center my-auto">
              Waiting for pipeline logs... Start the pipeline to see execution details.
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={log._id || i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-gray-600 shrink-0 select-none">
                  [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]
                </span>
                <span className="text-white break-all">
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </div>
  );
}
