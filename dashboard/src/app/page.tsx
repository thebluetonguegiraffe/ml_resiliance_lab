import Link from "next/link";
import { Play } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold mb-6 text-white tracking-tight">
          ML Resilience Lab
        </h1>
        <p className="text-lg text-gray-400 mb-12 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center gap-3 bg-[var(--primary)] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#1a9ad9] transition-transform hover:scale-105 shadow-lg shadow-[var(--primary)]/20"
        >
          <Play fill="currentColor" size={20} />
          Start Dashboard
        </Link>
      </div>
    </div>
  );
}
