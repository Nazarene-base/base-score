'use client';

import { useState } from 'react';
import { StatCard } from './StatCard';
import { Skeleton } from './Skeleton';
import { LEVELS } from '@/constants/levels';
import { LevelRing } from './LevelRing';
import { TransactionDetail } from './TransactionDetail';
import type { WalletStats, ChecklistItem as ChecklistItemType } from '@/types';

interface BaseScoreTabProps {
  baseScore: number;
  percentile: number;
  rank?: number;
  totalUsers?: number;
  stats: WalletStats;
  checklist: ChecklistItemType[];
  isLoading?: boolean;
  transactions?: any[];
}

export function BaseScoreTab({
  baseScore,
  percentile,
  rank = 0,
  totalUsers = 0,
  stats,
  checklist: _legacyChecklist,
  isLoading,
  transactions = []
}: BaseScoreTabProps) {
  const [showTxDetail, setShowTxDetail] = useState(false);

  // Calculate Level State
  let currentLevelIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    const level = LEVELS[i];
    const allReqsMet = level.requirements.every(req => req.check(stats));
    if (!allReqsMet) {
      currentLevelIndex = i;
      break;
    }
    if (i === LEVELS.length - 1) currentLevelIndex = i;
  }

  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1] || null;

  const reqsMet = currentLevel.requirements.filter(req => req.check(stats)).length;
  const totalReqs = currentLevel.requirements.length;
  const progressPercent = (reqsMet / totalReqs) * 100;

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="glass-card rounded-2xl p-6 flex justify-between">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 ml-6 space-y-3">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Level Progression Header */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-purple/10 blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-pink/5 blur-[60px] -z-10" />

        <div className="flex items-center gap-6">
          <LevelRing
            currentLevel={currentLevel}
            nextLevel={nextLevel}
            progressPercent={progressPercent}
          />

          <div className="flex-1 space-y-2">
            <p className="text-[9px] font-jetbrains-mono text-gray-500 uppercase tracking-[0.2em]">Current Mission</p>
            <h3 className="font-space-grotesk font-bold text-lg text-white leading-tight">
              {currentLevel.description}
            </h3>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-jetbrains-mono gradient-text px-2 py-1 rounded-full bg-accent-purple/10">
                Reward: {currentLevel.reward}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <StatCard
          label="On Base Since"
          value={formatDate(stats.firstTxDate)}
          subValue="early adopter"
          color="purple"
        />
        <StatCard
          label="Days Active"
          value={stats.daysActive.toString()}
          subValue="unique days"
        />
        <StatCard
          label="Transactions"
          value={stats.totalTransactions.toLocaleString()}
          subValue="tap for details"
          onClick={() => setShowTxDetail(true)}
        />
        <StatCard
          label="Volume"
          value={stats.totalVolume > 0 ? `$${Math.round(stats.totalVolume).toLocaleString()}` : '$0'}
          subValue="total moved"
          color={stats.totalVolume > 1000 ? 'success' : 'default'}
        />
      </div>

      {/* Level Requirements Checklist */}
      <div data-section="requirements" className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between px-1">
          <h3 className="font-space-grotesk font-bold text-white">Requirements</h3>
          <span className="text-[10px] text-gray-500 font-jetbrains-mono">
            <span className="gradient-text font-bold">{reqsMet}</span>/{totalReqs}
          </span>
        </div>

        <div className="space-y-2">
          {currentLevel.requirements.map((req, index) => {
            const isMet = req.check(stats);
            const isClickable = !isMet && req.actionUrl;

            const handleClick = () => {
              if (isClickable && req.actionUrl) {
                window.open(req.actionUrl, '_blank');
              }
            };

            return (
              <div
                key={req.id}
                onClick={handleClick}
                className={`
                  glass-card flex items-center gap-4 p-4 rounded-xl
                  transition-all duration-500 ease-out
                  animate-fade-in
                  ${isMet
                    ? 'border border-success/20 bg-success/5'
                    : 'border border-white/[0.05] hover:border-white/10'
                  }
                  ${isClickable ? 'cursor-pointer hover:bg-white/[0.03] active:scale-[0.99]' : ''}
                `}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                {/* Checkbox */}
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center border-2
                  transition-all duration-300
                  ${isMet
                    ? 'bg-gradient-to-br from-success to-success/70 border-success text-bg-primary animate-spring'
                    : 'border-gray-600 text-transparent'
                  }
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h4 className={`text-sm font-semibold ${isMet ? 'text-white' : 'text-gray-300'}`}>
                    {req.label}
                  </h4>
                  <p className="text-[11px] text-gray-500">{req.description}</p>
                </div>

                {/* Status Badge or Action Arrow */}
                {isMet ? (
                  <span className="text-[9px] font-jetbrains-mono uppercase text-success tracking-widest bg-success/10 px-2 py-1 rounded-full">
                    Done
                  </span>
                ) : isClickable ? (
                  <span className="text-gray-500 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetail
        isOpen={showTxDetail}
        onClose={() => setShowTxDetail(false)}
        transactions={transactions}
        totalCount={stats.totalTransactions}
      />
    </div>
  );
}
