'use client';

import { ScoreRing } from './ScoreRing';
import { StatCard } from './StatCard';
import { ChecklistItem } from './ChecklistItem';
import type { WalletStats, ChecklistItem as ChecklistItemType } from '@/types';
import { formatPercentile } from '@/utils/getRankInfo';



import { Skeleton } from './Skeleton';

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
  checklist,
  isLoading,
}: BaseScoreTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Score Header Skeleton */}
        <div className="bg-gradient-to-br from-bg-card to-bg-secondary rounded-2xl p-6 border border-border flex items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-20 h-6 rounded-full" />
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
              <Skeleton className="w-20 h-3 mb-2" />
              <Skeleton className="w-16 h-6 mb-1" />
              <Skeleton className="w-12 h-2" />
            </div>
          ))}
        </div>

        {/* Checklist Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-16 h-4" />
          </div>
          <Skeleton className="w-full h-1 rounded-full" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                <Skeleton className="w-5 h-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-48 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  const completedTasks = checklist.filter((t) => t.completed).length;
  const totalTasks = checklist.length;
  const progressPercent = (completedTasks / totalTasks) * 100;

  // Format first transaction date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-5">
      {/* Score Header Card */}
      <div className="bg-gradient-to-br from-bg-card to-bg-secondary rounded-2xl p-6 border border-border flex items-center gap-6 animate-fade-in">
        <ScoreRing score={baseScore} />

        <div>
          {/* Percentile badge */}
          <div className="inline-block px-2.5 py-1 bg-success/15 rounded-full text-xs font-semibold text-success mb-2">
            {formatPercentile(baseScore)}
          </div>

          <div className="text-sm text-gray-400 mb-1">
            {rank > 0 ? `Rank #${rank.toLocaleString()}` : 'Unranked'}
          </div>

          <div className="text-xs text-gray-500">
            {totalUsers > 0 ? `of ${totalUsers.toLocaleString()} users` : 'Join the leaderboard'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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
          subValue="total swapped"
        />
      </div>

      {/* Protocol Checklist */}
      <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-space-grotesk font-bold">Base Checklist</h3>
          <span className="text-xs text-gray-400 font-jetbrains-mono">
            {completedTasks}/{totalTasks} Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-base-blue transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="space-y-2">
          {checklist.map((item, index) => (
            <ChecklistItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
