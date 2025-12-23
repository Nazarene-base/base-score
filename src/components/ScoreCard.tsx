'use client';

import React, { useEffect, useState } from 'react';
import { formatPercentile, getRankInfo, getPercentileEstimate, getPercentileMessage } from '@/utils/getRankInfo';
import { Skeleton } from './Skeleton';

interface ScoreHeroProps {
  score: number;
  percentile: number;
  isLoading?: boolean;
}

export default function ScoreHero({ score, percentile, isLoading }: ScoreHeroProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animated count-up effect
  useEffect(() => {
    if (isLoading || hasAnimated) return;

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setDisplayScore(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayScore(score);
        setHasAnimated(true);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, isLoading, hasAnimated]);

  // Sync if score changes externally
  useEffect(() => {
    if (hasAnimated) {
      setDisplayScore(score);
    }
  }, [score, hasAnimated]);

  const isVerified = score >= 50;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl glass-card p-8 animate-pulse">
        <div className="flex flex-col items-center justify-center py-8">
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-32 w-48 rounded-2xl mb-4" />
          <div className="flex items-center gap-8 mt-4">
            <Skeleton className="h-16 w-24 rounded-xl" />
            <Skeleton className="h-16 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl glass-card">
      {/* Ambient Glow Effects */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-accent-purple/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-accent-pink/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-12 px-6">

        {/* Label */}
        <p className="text-[10px] font-jetbrains-mono text-gray-400 uppercase tracking-[0.4em] mb-4">
          Network Authority Score
        </p>

        {/* The Big Score Number */}
        <div className="relative mb-2">
          <h1 className={`text-[140px] font-space-grotesk font-bold leading-none tracking-tighter gradient-text ${hasAnimated ? '' : 'animate-count-up'}`}>
            {displayScore}
          </h1>

          {/* Glowing Status Indicator */}
          <div className="absolute -top-2 -right-2 flex h-5 w-5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isVerified ? 'bg-accent-purple' : 'bg-gray-500'} opacity-30`} />
            <span className={`relative inline-flex rounded-full h-5 w-5 ${isVerified ? 'bg-gradient-to-br from-accent-purple to-accent-pink shadow-[0_0_20px_rgba(123,97,255,0.8)]' : 'bg-gray-600'}`} />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 font-medium mb-8">
          of 1000 possible points
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-1 w-full max-w-xs">
          {/* Percentile Card */}
          <div className="flex-1 glass-card rounded-2xl p-4 text-center shine-effect">
            <p className="text-[9px] font-jetbrains-mono text-gray-500 uppercase tracking-widest mb-2">Percentile</p>
            <p className="text-2xl font-space-grotesk font-bold gradient-text">
              {formatPercentile(getPercentileEstimate(score))}
            </p>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2" />

          {/* Status Card with Tier Badge */}
          <div className="flex-1 glass-card rounded-2xl p-4 text-center shine-effect">
            <p className="text-[9px] font-jetbrains-mono text-gray-500 uppercase tracking-widest mb-2">Rank</p>
            <p className={`text-xl font-space-grotesk font-bold flex items-center justify-center gap-1.5 ${isVerified ? 'gradient-text' : 'text-gray-400'}`}>
              <span className="text-2xl">{getRankInfo(score).emoji}</span>
              {getRankInfo(score).tier}
            </p>
          </div>
        </div>

        {/* FOMO Percentile Message */}
        <p className="text-center text-sm text-gray-400 mt-6 font-medium">
          {score > 0 ? (
            <>{getPercentileMessage(score)}</>
          ) : (
            <>Connect your wallet to see your score</>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 w-full max-w-xs">
          {/* Share Button */}
          <button
            onClick={() => {
              const shareText = encodeURIComponent(`My Base Score: ${score}/1000 🔵\n\nCheck your on-chain reputation on Base.`);
              const shareUrl = encodeURIComponent(`https://base-score-neon.vercel.app`);
              window.open(`https://warpcast.com/~/compose?text=${shareText}&embeds[]=${shareUrl}`, '_blank');
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold text-sm shadow-lg shadow-accent-purple/25 hover:shadow-accent-purple/40 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
            </svg>
            Share Score
          </button>

          {/* Boost Button - scrolls to requirements */}
          <button
            onClick={() => {
              document.querySelector('[data-section="requirements"]')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-card border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
            </svg>
            Boost Score
          </button>
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent" />
    </div>
  );
}