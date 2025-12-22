'use client';

import { StatCard } from './StatCard';
import { Skeleton } from './Skeleton';
import { LEVELS } from '@/constants/levels';
import { LevelRing } from './LevelRing';
import type { WalletStats, ChecklistItem as ChecklistItemType } from '@/types';
import { formatPercentile } from '@/utils/getRankInfo';

interface BaseScoreTabProps {
  baseScore: number;
  percentile: number;
  rank?: number;
  totalUsers?: number;
  stats: WalletStats;
  checklist: ChecklistItemType[];
  isLoading?: boolean;
}

export function BaseScoreTab({
  baseScore,
  percentile,
  rank = 0,
  totalUsers = 0,
  stats,
  checklist: _legacyChecklist, // We use the new LEVELS system now
  isLoading,
}: BaseScoreTabProps) {

  // Calculate Level State
  // We iterate through levels to find the first incomplete one
  let currentLevelIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    const level = LEVELS[i];
    const allReqsMet = level.requirements.every(req => req.check(stats));
    if (!allReqsMet) {
      currentLevelIndex = i;
      break;
    }
    // If it's the last level and all met, stay on last level
    if (i === LEVELS.length - 1) currentLevelIndex = i;
  }

  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1] || null;

  // Calculate granular progress within the level
  const reqsMet = currentLevel.requirements.filter(req => req.check(stats)).length;
  const totalReqs = currentLevel.requirements.length;
  const progressPercent = (reqsMet / totalReqs) * 100;

  // Format first transaction date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Simplified Skeleton for new Layout */}
        <div className="bg-bg-card rounded-2xl p-6 border border-border flex justify-between">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 ml-6 space-y-3">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Level Progression Header (Replaces old Score Header) */}
      <div className="bg-gradient-to-br from-bg-card to-bg-secondary rounded-2xl p-6 border border-border flex items-center justify-between animate-fade-in relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-base-blue/5 blur-[80px] -z-10" />

        <div className="flex items-center gap-8">
          <LevelRing
            currentLevel={currentLevel}
            nextLevel={nextLevel}
            progressPercent={progressPercent}
          />

          <div className="space-y-1">
            <h3 className="font-space-grotesk font-bold text-xl text-white">Current Mission</h3>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              {currentLevel.description}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs font-jetbrains-mono text-base-blue bg-base-blue/10 px-2 py-1 rounded">
                Reward: {currentLevel.reward}
              </span>
            </div>
          </div>
        </div>

        {/* Global Rank (Mini) */}
        <div className="text-right hidden sm:block">
          <div className="text-3xl font-bold font-space-grotesk text-white">{baseScore}</div>
          <div className="text-xs text-gray-500 font-jetbrains-mono uppercase">Total Score</div>
        </div>
      </div>

      {/* 2. Stats Grid (Kept the same, it's good) */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <StatCard
          label="On Base Since"
          value={formatDate(stats.firstTxDate)}
          subValue="early adopter"
        />
        <StatCard
          label="Days Active"
          value={stats.daysActive.toString()}
          subValue="unique days"
        />
        <StatCard
          label="Tx Count"
          value={stats.totalTransactions.toLocaleString()}
          subValue="total txs"
        />
        <StatCard
          label="Volume"
          value={stats.totalVolume > 0 ? `$${Math.round(stats.totalVolume).toLocaleString()}` : '$0'}
          subValue="real value"
        />
      </div>

      {/* 3. Level Requirements Checklist */}
      <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-space-grotesk font-bold">Level Requirements</h3>
          <span className="text-xs text-gray-400 font-jetbrains-mono">
            {reqsMet}/{totalReqs} Completed
          </span>
        </div>

        <div className="space-y-2">
          {currentLevel.requirements.map((req) => {
            const isMet = req.check(stats);
            return (
              <div
                key={req.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${isMet
                  ? 'bg-success/5 border-success/20'
                  : 'bg-white/[0.02] border-white/[0.05] hover:border-white/10'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isMet ? 'bg-success border-success text-black' : 'border-gray-600 text-transparent'
                  }`}>
                  {/* Simple Checkmark SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>

                <div className="flex-1">
                  <h4 className={`text-sm font-semibold ${isMet ? 'text-white' : 'text-gray-300'}`}>
                    {req.label}
                  </h4>
                  <p className="text-xs text-gray-500">{req.description}</p>
                </div>

                {isMet && (
                  <span className="text-[10px] font-jetbrains-mono uppercase text-success tracking-widest">
                    Completed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
