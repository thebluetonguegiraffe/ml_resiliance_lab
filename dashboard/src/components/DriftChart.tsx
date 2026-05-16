"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity } from "lucide-react";

interface DriftChartProps {
  data: { name: string; value: number }[];
}

export default function DriftChart({ data }: DriftChartProps) {
  return (
    <div className="bg-[var(--card)] p-6 rounded-xl border border-gray-800 shadow-sm flex flex-col h-[400px]">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Activity className="text-[var(--primary)]" />
        Transaction Volume by Hour
      </h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#87888c" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#87888c" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              cursor={{ fill: '#2a2b36' }} 
              contentStyle={{ backgroundColor: '#171821', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
            />
            <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
