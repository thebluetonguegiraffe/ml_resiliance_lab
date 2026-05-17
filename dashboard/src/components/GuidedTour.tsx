"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, X, HelpCircle, Rocket } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface Step {
  targetId: string;
  title: string;
  description: string;
  position: 'bottom' | 'top' | 'center';
}

const steps: Step[] = [
  {
    targetId: 'welcome',
    title: 'Welcome to the Lab',
    description: 'This guided tour will show you how to monitor and stress-test your ML Resilience Pipeline. Get ready to explore the system architecture and learn how to handle real-world data failures.',
    position: 'center'
  },
  {
    targetId: 'tour-stats',
    title: 'System Health Stats',
    description: 'Monitor key metrics: blocked transactions, API health status, and detected drift levels. These metrics provide a high-level overview of your system stability in real-time.',
    position: 'bottom'
  },
  {
    targetId: 'tour-controls',
    title: 'Operational Control',
    description: 'This is the command center. Start/stop the data stream or inject faults (API failures, data drift) to observe how the pipeline handles adversarial conditions.',
    position: 'bottom'
  },
  {
    targetId: 'tour-board',
    title: 'Live Pipeline Board',
    description: 'Track each transaction through Bronze, Silver, and Gold layers. Red badges indicate contract violations or high-risk scores that require immediate attention.',
    position: 'top'
  },
  {
    targetId: 'tour-logs',
    title: 'System Console',
    description: 'The low-level event stream. Monitor technical processing logs and detailed layer transitions to debug exactly what happens behind the scenes.',
    position: 'top'
  }
];

export default function GuidedTour() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Auto-start tour if requested via URL with a slight delay
  useEffect(() => {
    if (searchParams.get('tour') === 'true') {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        // Clean up URL so it doesn't re-trigger on refresh/reset
        router.replace('/pipeline', { scroll: false });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const getZoom = () => {
    // Read the CSS zoom applied to the <html> element (our responsive scaling)
    const zoom = parseFloat(getComputedStyle(document.documentElement).zoom);
    return isNaN(zoom) ? 1 : zoom;
  };

  const updateCoords = useCallback(() => {
    if (currentStep < 0) return;
    const step = steps[currentStep];
    
    if (step.targetId === 'welcome') {
      setCoords({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }

    const target = document.getElementById(step.targetId);
    if (target) {
      const rect = target.getBoundingClientRect();
      const zoom = getZoom();
      // getBoundingClientRect() returns coords in zoomed space.
      // Divide by zoom to get the true visual position for our fixed overlay.
      setCoords({
        top: rect.top / zoom,
        left: rect.left / zoom,
        width: rect.width / zoom,
        height: rect.height / zoom
      });
      
      // Scroll to target if it's out of view (use unscaled viewport height)
      const visualHeight = window.innerHeight / zoom;
      if (rect.top / zoom < 0 || (rect.top + rect.height) / zoom > visualHeight) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep]);

  useEffect(() => {
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [updateCoords, currentStep]);

  if (currentStep < 0) {
    return (
      <button 
        onClick={() => setCurrentStep(0)}
        className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-40 flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:px-6 lg:py-3 bg-[var(--primary)] text-white text-xs lg:text-sm xl:text-base font-bold rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all group"
      >
        <HelpCircle className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform" />
        Quick Tour
      </button>
    );
  }

  const step = steps[currentStep];
  const isWelcome = step.targetId === 'welcome';
  const padding = 15;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Dim Overlay with Spotlight Hole */}
      <div 
        className="absolute inset-0 bg-black/85 transition-all duration-500 ease-in-out"
        style={{
          clipPath: isWelcome 
            ? 'none' 
            : `polygon(
              0% 0%, 0% 100%, 
              ${coords.left - padding}px 100%, 
              ${coords.left - padding}px ${coords.top - padding}px, 
              ${coords.left + coords.width + padding}px ${coords.top - padding}px, 
              ${coords.left + coords.width + padding}px ${coords.top + coords.height + padding}px, 
              ${coords.left - padding}px ${coords.top + coords.height + padding}px, 
              ${coords.left - padding}px 100%, 
              100% 100%, 100% 0%
            )`
        }}
      />

      {/* Tooltip */}
      <div 
        className={`absolute z-10 w-[92vw] max-w-[440px] p-5 lg:p-8 bg-[#1c1e2a] border border-gray-700 rounded-2xl lg:rounded-3xl shadow-2xl pointer-events-auto transition-all duration-500 ease-in-out animate-in zoom-in-95 ${
          isWelcome ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={!isWelcome ? (() => {
          const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
          const visualWidth = window.innerWidth / zoom;
          return {
            top: step.position === 'bottom' ? coords.top + coords.height + 15 : Math.max(10, coords.top - 260),
            left: Math.max(10, Math.min(visualWidth - 460, coords.left + coords.width / 2 - 220))
          };
        })() : {}}
      >
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/50 to-transparent rounded-t-2xl lg:rounded-t-3xl"></div>
        
        <div className="flex justify-between items-start mb-4 lg:mb-6">
          <div className="flex flex-col">
            <span className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Module {currentStep + 1} of {steps.length}</span>
            <div className="flex items-center gap-2 lg:gap-3">
              {isWelcome && <Rocket className="text-[var(--primary)] w-5 h-5 lg:w-6 lg:h-6" />}
              <h3 className="text-lg lg:text-2xl font-black text-white uppercase tracking-tighter leading-none">{step.title}</h3>
            </div>
          </div>
          <button 
            onClick={() => setCurrentStep(-1)} 
            className="p-1 lg:p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg lg:rounded-xl transition-colors"
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
        
        <p className="text-gray-400 text-xs lg:text-sm xl:text-base leading-relaxed mb-6 lg:mb-10 text-justify">
          {step.description}
        </p>
        
        <div className="flex justify-between items-center gap-3 lg:gap-4 mt-auto">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)} 
                className="flex items-center gap-1 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs lg:text-sm font-bold rounded-lg lg:rounded-xl transition-all"
              >
                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                Back
              </button>
            )}
          </div>
          <button 
            onClick={() => currentStep === steps.length - 1 ? setCurrentStep(-1) : setCurrentStep(currentStep + 1)} 
            className="flex-1 flex items-center justify-center gap-1 lg:gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-[var(--primary)] text-white text-xs lg:text-sm font-bold lg:font-black rounded-lg lg:rounded-xl hover:bg-[var(--primary-hover)] transition-all active:scale-95 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
          >
            {currentStep === steps.length - 1 ? 'Finish Lab Tour' : 'Next Step'}
            <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
