// Stat Card - Reusable card for displaying statistics
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
  const colorClasses = {
    default: 'text-white',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
  };

  return (
    <div className="bg-bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        {icon && <span className={colorClasses[color]}>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold font-mono ${colorClasses[color]}`}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-gray-500 mt-1">{subValue}</div>
      )}
    </div>
  );
}
