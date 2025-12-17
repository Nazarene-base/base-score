'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  color?: 'default' | 'success' | 'danger' | 'warning';
}

export function StatCard({ label, value, subValue, icon, color = 'default' }: StatCardProps) {
  const colorMap = {
    default: 'text-white border-white/5 bg-white/[0.02]',
    success: 'text-green-400 border-green-500/10 bg-green-500/[0.02]',
    danger: 'text-red-400 border-red-500/10 bg-red-500/[0.02]',
    warning: 'text-yellow-400 border-yellow-500/10 bg-yellow-500/[0.02]',
  };

  return (
    <div className={`
      group relative overflow-hidden rounded-[2rem] border p-6 
      backdrop-blur-2xl transition-all duration-700 
      hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-1
      ${colorMap[color]}
    `}>
      {/* Dynamic Background Mesh - The "Impressive" Factor */}
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-current opacity-[0.03] blur-3xl transition-all duration-1000 group-hover:opacity-[0.1] group-hover:scale-150" />
      
      <div className="flex items-center justify-between mb-8">
        <span className="text-[10px] font-jetbrains-mono uppercase tracking-[0.3em] text-gray-500 group-hover:text-gray-300 transition-colors">
          {label}
        </span>
        {icon && (
          <div className="opacity-30 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            {icon}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-space-grotesk font-bold tracking-tight">
          {value}
        </h3>
        {subValue && (
          <p className="text-[10px] font-jetbrains-mono text-gray-500 opacity-80 mt-1">
            {subValue}
          </p>
        )}
      </div>

      {/* Modern interactive indicator line */}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-current opacity-30 transition-all duration-1000 group-hover:w-full" />
    </div>
  );
}