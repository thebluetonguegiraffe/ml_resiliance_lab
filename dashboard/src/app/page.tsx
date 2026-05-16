"use client";

import { Activity, ShieldCheck, Zap, ArrowRight, BarChart3, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleNavigate = (path: string) => {
    setIsExiting(true);
    const finalPath = path === '/pipeline' ? '/pipeline?tour=true' : path;
    setTimeout(() => {
      router.push(finalPath);
    }, 600); // Fast transition
  };

  return (
    <div className={`min-h-screen bg-[#0f111a] text-white font-sans selection:bg-[var(--primary)]/30 overflow-hidden ${isExiting ? 'blur-transition-out' : ''}`}>
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--success)]/5 blur-[120px] rounded-full"></div>
      </div>

      <nav className="relative z-10 h-20 flex items-center justify-between px-8 border-b border-gray-800 bg-[#161721]">
        <div className="flex items-center gap-3">
          <Activity className="text-[var(--primary)]" size={32} />
          <h1 className="text-2xl font-bold text-white tracking-tighter uppercase">
            ML Resilience <span className="text-[var(--primary)]">Lab</span>
          </h1>
        </div>
      </nav>

      <main className={`relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center ${isExiting ? '' : 'animate-in fade-in duration-700'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
          </span>
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400">System Live • Version 1.0</span>
        </div>

        <h2 className="text-7xl font-black tracking-tighter uppercase mb-6 max-w-5xl leading-[0.9]">
          Real-time <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-purple-500">ML Pipeline</span> Monitoring & Stress Testing
        </h2>

        <p className="text-gray-400 text-lg max-w-2xl mb-12 leading-relaxed">
          Experience the intersection of high-frequency data engineering and resilient machine learning. 
          Monitor, simulate failures, and analyze model behavior in mission-critical environments.
        </p>

        <div className="flex gap-6">
          <button
            onClick={() => handleNavigate('/pipeline')}
            className="group flex items-center gap-3 px-10 py-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black rounded-2xl transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)]"
          >
            LAUNCH LABORATORY
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
          <button
            onClick={() => handleNavigate('/model')}
            className="flex items-center gap-3 px-10 py-5 bg-white/5 hover:bg-white/10 border border-gray-800 rounded-2xl text-white font-bold transition-all hover:border-gray-600 active:scale-95"
          >
            VIEW MODEL SPECS
          </button>
        </div>

        {/* Feature Grid - Synchronized Exit */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-40 max-w-6xl w-full text-left transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'animate-in fade-in slide-in-from-bottom-12 duration-1000'}`}>
          <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
            <Zap className="text-[var(--primary)] mb-6" size={32} />
            <h3 className="text-xl font-bold text-white mb-3">Stress Testing</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Inject faults in real-time. Simulate API outages, data corruption, and adversarial drift.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
            <BarChart3 className="text-[var(--success)] mb-6" size={32} />
            <h3 className="text-xl font-bold text-white mb-3">Live Observability</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Visualize transaction flow through Bronze, Silver, and Gold layers with sub-second latency.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
            <ShieldCheck className="text-[var(--warning)] mb-6" size={32} />
            <h3 className="text-xl font-bold text-white mb-3">Model Drift Analysis</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Analyze model performance under stress and monitor statistical distribution shifts.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-gray-800/50 py-12 px-8 mt-20 flex justify-between items-center text-gray-500 text-xs font-bold tracking-widest uppercase">
        <div>© 2026 ML Resilience Laboratory</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">API Specs</a>
          <a href="#" className="hover:text-white transition-colors">Source Code</a>
        </div>
      </footer>

      <style jsx global>{`
        .blur-transition-out {
          animation: blur-in-fast 0.6s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
        }

        @keyframes blur-in-fast {
          0% {
            filter: blur(0px);
            opacity: 1;
            transform: scale(1);
          }
          100% {
            filter: blur(20px);
            opacity: 0;
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
