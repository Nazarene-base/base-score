'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  color?: 'default' | 'success' | 'danger' | 'warning' | 'purple';
  onClick?: () => void;
}

export function StatCard({ label, value, subValue, icon, color = 'default', onClick }: StatCardProps) {
  const colorConfig = {
    default: {
      text: 'text-white',
      glow: 'bg-accent-purple/10',
      border: 'border-white/[0.06] hover:border-accent-purple/30',
    },
    success: {
      text: 'text-success',
      glow: 'bg-success/10',
      border: 'border-success/10 hover:border-success/30',
    },
    danger: {
      text: 'text-danger',
      glow: 'bg-danger/10',
      border: 'border-danger/10 hover:border-danger/30',
    },
    warning: {
      text: 'text-warning',
      glow: 'bg-warning/10',
      border: 'border-warning/10 hover:border-warning/30',
    },
    purple: {
      text: 'gradient-text',
      glow: 'bg-accent-purple/15',
      border: 'border-accent-purple/20 hover:border-accent-purple/40',
    },
  };

  const config = colorConfig[color];

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-2xl border p-5
        glass-card shine-effect
        transition-all duration-500 ease-out
        hover:scale-[1.02] hover:-translate-y-1
        ${config.border}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
      `}
    >
      {/* Background Glow Effect */}
      <div className={`
        absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl
        transition-all duration-700 ease-out
        ${config.glow}
        opacity-0 group-hover:opacity-100 group-hover:scale-150
      `} />

      {/* Accent Line on Left */}
      <div className={`
        absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[3px] rounded-full
        bg-gradient-to-b from-accent-purple to-accent-pink
        transition-all duration-500 group-hover:h-8
      `} />

      <div className="relative z-10">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-jetbrains-mono uppercase tracking-[0.2em] text-gray-500 group-hover:text-gray-300 transition-colors">
            {label}
          </span>
          {icon && (
            <div className={`
              opacity-40 group-hover:opacity-100 
              group-hover:scale-110 group-hover:rotate-6 
              transition-all duration-500
              ${config.text}
            `}>
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex flex-col gap-1">
          <h3 className={`text-2xl font-space-grotesk font-bold tracking-tight ${config.text}`}>
            {value}
          </h3>
          {subValue && (
            <p className="text-[10px] font-jetbrains-mono text-gray-500 opacity-70 group-hover:opacity-100 transition-opacity">
              {subValue}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="
        absolute bottom-0 left-0 h-[1px] w-0 
        bg-gradient-to-r from-accent-purple to-accent-pink
        transition-all duration-700 group-hover:w-full
      " />
    </div>
  );
}