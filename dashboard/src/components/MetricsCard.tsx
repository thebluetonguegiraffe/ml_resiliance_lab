import { ReactNode } from "react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  status?: "default" | "success" | "warning" | "danger";
  subtitle?: string;
}

export default function MetricsCard({ title, value, icon, status = "default", subtitle }: MetricsCardProps) {
  const statusColors = {
    default: "text-[var(--primary)] bg-[var(--primary)]/10",
    success: "text-[var(--success)] bg-[var(--success)]/10",
    warning: "text-[var(--warning)] bg-[var(--warning)]/10",
    danger: "text-[var(--danger)] bg-[var(--danger)]/10",
  };

  const badgeColor = statusColors[status];

  return (
    <div className="bg-[var(--card)] p-3 rounded-xl border border-gray-800 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
      <div>
        <p className="text-gray-400 text-xs font-medium mb-1">{title}</p>
        <div className="flex items-end gap-2">
          <h3 className="text-xl font-bold text-white">{value}</h3>
          {subtitle && (
             <span className={`text-[10px] font-semibold px-2 py-0.5 rounded mb-0.5 ${badgeColor}`}>
               {subtitle}
             </span>
          )}
        </div>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${badgeColor}`}>
        {icon}
      </div>
    </div>
  );
}
