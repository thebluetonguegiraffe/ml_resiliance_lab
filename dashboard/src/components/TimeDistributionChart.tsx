"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface DataPoint {
  name: string;
  value: number;
}

export default function TimeDistributionChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-[#1c1e2a] p-8 rounded-2xl border border-gray-800 shadow-2xl h-full">
      <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
        Transaction Time Distribution
        <span className="text-[10px] font-black text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded border border-[var(--primary)]/20 uppercase tracking-widest">
          24h Logical Window
        </span>
      </h3>

      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3d" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              contentStyle={{
                backgroundColor: '#161721',
                border: '1px solid #374151',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
              }}
              itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
            />
            <Bar
              dataKey="value"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

