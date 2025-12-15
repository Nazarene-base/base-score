// Base Score Tab - Shows activity score and checklist
'use client';

import { ScoreRing } from './ScoreRing';
import { StatCard } from './StatCard';
import { ChecklistItem } from './ChecklistItem';
import type { WalletStats, ChecklistItem as ChecklistItemType } from '@/types';

interface BaseScoreTabProps {
  baseScore: number;
  percentile: number;
  rank?: number;
  totalUsers?: number;
  stats: WalletStats;
  checklist: ChecklistItemType[];
}

export function BaseScoreTab({
  baseScore,
  percentile,
  rank = 1247,
  totalUsers = 156000,
  stats,
  checklist,
}: BaseScoreTabProps) {
  const completedTasks = checklist.filter((t) => t.completed).length;
  const totalTasks = checklist.length;
  const progressPercent = (completedTasks / totalTasks) * 100;

  // Format first transaction date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
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
            Top {100 - percentile}%
          </div>
          
          <div className="text-sm text-gray-400 mb-1">
            Rank #{rank.toLocaleString()}
          </div>
          
          <div className="text-xs text-gray-500">
            of {totalUsers.toLocaleString()} users
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <StatCard
          label="Transactions"
          value={stats.totalTransactions}
          subValue={`${stats.daysActive} days active`}
        />
        <StatCard
          label="Protocols"
          value={stats.uniqueProtocols}
          subValue="unique interactions"
        />
        <StatCard
          label="Volume"
          value={`$${stats.totalVolume.toLocaleString()}`}
          subValue="total traded"
        />
        <StatCard
          label="On Base Since"
          value={formatDate(stats.firstTxDate)}
          subValue="early adopter"
        />
      </div>

      {/* Checklist Section */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Airdrop Checklist</h3>
          <span className="text-sm text-success font-mono">
            {completedTasks}/{totalTasks}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-bg-tertiary rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-base-blue to-success rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist items */}
        <div className="space-y-2">
          {checklist.map((item, index) => (
            <ChecklistItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
