"use client";

import { Activity, ArrowRight } from "lucide-react";
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
    <div className={`min-h-screen flex flex-col justify-between bg-[#0f111a] text-white font-sans selection:bg-[var(--primary)]/30 ${isExiting ? 'blur-transition-out' : ''}`}>
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--success)]/5 blur-[120px] rounded-full"></div>
      </div>

      <nav className="relative z-10 h-16 lg:h-20 shrink-0 flex items-center justify-between px-4 lg:px-8 border-b border-gray-800 bg-[#161721]">
        <div className="flex items-center gap-2 lg:gap-3">
          <Activity className="text-[var(--primary)] w-6 h-6 lg:w-8 lg:h-8" />
          <h1 className="text-base lg:text-2xl font-black text-white tracking-tighter uppercase leading-none">
            ML RESILIENCE <span className="text-[var(--primary)]">LAB</span>
          </h1>
        </div>
      </nav>

      <main className={`relative z-10 flex-1 flex flex-col items-center justify-center py-8 pb-16 px-4 md:px-6 text-center ${isExiting ? '' : 'animate-in fade-in duration-700'}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 mb-3 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">System Live • Version 1.0</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase mb-4 max-w-4xl leading-[0.9]">
          Real-time <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-purple-500">Fraud Detection </span> Pipeline & Stress Testing
        </h2>

        <p className="text-gray-400 text-xs md:text-sm lg:text-base max-w-xl mb-6 leading-relaxed">
          Experience how credit card transactions are processed and how fraud is detected in real time using a machine learning model and an robust resilient pipeline.
          Monitor the system, simulate data failures, and analyze how the model behaves under pressure.
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 shrink-0">
          <button
            onClick={() => handleNavigate('/pipeline')}
            className="group flex items-center justify-center gap-2.5 px-7 py-3.5 lg:px-9 lg:py-4.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-xs lg:text-sm font-black rounded-2xl transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)] text-white"
          >
            LAUNCH LABORATORY
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
          <button
            onClick={() => handleNavigate('/model')}
            className="flex items-center justify-center gap-2.5 px-7 py-3.5 lg:px-9 lg:py-4.5 bg-white/5 hover:bg-white/10 border border-gray-800 rounded-2xl text-white text-xs lg:text-sm font-bold transition-all hover:border-gray-600 active:scale-95"
          >
            MODEL SPECS
          </button>
          <button
            onClick={() => handleNavigate('/resilience')}
            className="flex items-center justify-center gap-2.5 px-7 py-3.5 lg:px-9 lg:py-4.5 bg-white/5 hover:bg-white/10 border border-gray-800 rounded-2xl text-white text-xs lg:text-sm font-bold transition-all hover:border-[var(--warning)]/50 hover:text-[var(--warning)] active:scale-95"
          >
            RESILIENCE STRATEGIES
          </button>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-20 border-t border-gray-800/50 py-4 px-4 lg:px-8 flex justify-between items-center text-gray-500 text-xs font-bold tracking-widest uppercase bg-[#0f111a]">
        <div>© 2026 ML Resilience Laboratory</div>
        <div className="flex gap-4 lg:gap-8">
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
