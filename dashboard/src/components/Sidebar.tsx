import { LayoutDashboard, Database, Activity, Settings, Users } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[var(--card)] border-r border-gray-800 flex flex-col h-screen fixed">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="text-[var(--primary)]" />
          ML Resilience Lab
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg font-medium">
          <LayoutDashboard size={20} />
          Dashboard
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Database size={20} />
          Data Pipelines
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Users size={20} />
          Human Review
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Settings size={20} />
          Settings
        </a>
      </nav>
    </aside>
  );
}
