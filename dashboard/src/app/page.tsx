"use client";

import { Activity, ArrowRight, FileText } from "lucide-react";
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
        <div className="flex items-center gap-4">
          <a href="https://github.com/thebluetonguegiraffe/ml_resiliance_lab/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[var(--primary)] transition-colors" title="Documentation">
            <FileText className="w-5 h-5 lg:w-6 lg:h-6" />
          </a>
          <a href="https://github.com/thebluetonguegiraffe/ml_resiliance_lab" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" title="GitHub Repository">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
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
          Real-time <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-purple-500">Credit Card Fraud Detection </span> Pipeline & Stress Testing
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
