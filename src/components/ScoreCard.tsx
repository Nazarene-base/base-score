'use client';

import React from 'react';
import { formatPercentile } from '@/utils/getRankInfo';

interface ScoreHeroProps {
  score: number;
  percentile: number;
}

export default function ScoreHero({ score, percentile }: ScoreHeroProps) {
  const isVerified = score >= 100;

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in relative overflow-hidden rounded-3xl border border-white/[0.03] bg-gradient-to-b from-white/[0.02] to-transparent">
      {/* Background Decorative Glow - Professional touch */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-base-blue/10 blur-[100px] -z-10" />

      <p className="text-[10px] font-jetbrains-mono text-gray-500 uppercase tracking-[0.4em] mb-6">
        Network Authority Score
      </p>

      <div className="relative">
        <h1 className="text-[120px] font-space-grotesk font-bold leading-none tracking-tighter text-white drop-shadow-2xl">
          {score}
        </h1>

        {/* The "Status Dot" - High-end minimalist detail */}
        <div className="absolute -top-1 -right-4 flex h-4 w-4">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isVerified ? 'bg-base-blue' : 'bg-gray-500'} opacity-20`}></span>
          <span className={`relative inline-flex rounded-full h-4 w-4 ${isVerified ? 'bg-base-blue shadow-[0_0_15px_rgba(0,82,255,0.8)]' : 'bg-gray-500 shadow-none'}`}></span>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6">
        <div className="text-center">
          <p className="text-[10px] font-jetbrains-mono text-gray-500 uppercase tracking-widest mb-1">Percentile</p>
          <p className="text-lg font-space-grotesk font-bold text-white">
            {formatPercentile(score)}
          </p>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <div className="text-center">
          <p className="text-[10px] font-jetbrains-mono text-gray-500 uppercase tracking-widest mb-1">Status</p>
          <p className={`text-lg font-space-grotesk font-bold ${isVerified ? 'text-base-blue' : 'text-gray-500'}`}>
            {isVerified ? 'Verified' : 'Unverified'}
          </p>
        </div>
      </div>
    </div>
  );
}