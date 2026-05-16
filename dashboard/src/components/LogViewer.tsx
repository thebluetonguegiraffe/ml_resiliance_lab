"use client";

import { Terminal } from "lucide-react";

interface LogEntry {
  _id: string;
  message: string;
  type: 'stdout' | 'stderr';
  timestamp: string;
}

export default function LogViewer({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex items-center gap-2 px-2">
        <Terminal className="text-[var(--primary)]" size={20} />
        <h2 className="text-lg font-bold text-white">Pipeline Execution Logs</h2>
      </div>

      <div className="bg-[#0b0c14] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">bash — python3 run.py</span>
        </div>

        {/* Content */}
        <div className="p-4 font-mono text-xs overflow-y-auto max-h-[300px] flex flex-col gap-1 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-gray-600 italic py-4 text-center">
              Waiting for pipeline logs... Start the pipeline to see execution details.
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={log._id || i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-gray-600 shrink-0 select-none">
                  [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]
                </span>
                <span className={`${log.type === 'stderr' ? 'text-red-400' : 'text-gray-300'} break-all`}>
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
