import { WalletStats } from '@/types';
import { LEVELS } from '@/constants/levels';

/**
 * BASE SCORE - QUEST COMPLETION SYSTEM
 * Score = Percentage of Level Requirements Completed
 * 
 * The user wants the score to represent how far they are through the "quests" (levels).
 * e.g., "Has it done 5% of it? 10%?"
 */

interface ScoreBreakdown {
  total: number;
  citizen: {
    total: number;
    walletAge: number;
    transactionCount: number;
  };
  whale: {
    total: number;
    tradingVolume: number;
    ethBalance: number;
  };
  explorer: {
    total: number;
    protocolDiversity: number;
    identity: number;
  };
}

/**
 * Main scoring function - calculates total Base Score based on Quest Completion
 */
export function calculateBaseScore(stats: WalletStats, ethBalance: number = 0): ScoreBreakdown {
  // 1. Calculate Total Requirements across all levels
  let totalRequirements = 0;
  let completedRequirements = 0;

  LEVELS.forEach(level => {
    level.requirements.forEach(req => {
      totalRequirements++;
      if (req.check(stats)) {
        completedRequirements++;
      }
    });
  });

  // 2. Calculate Percentage Score
  const rawScore = totalRequirements > 0
    ? (completedRequirements / totalRequirements) * 100
    : 0;

  const totalScore = Math.floor(rawScore);

  // 3. Map to Legacy Structure for UI Compatibility (Optional but safe)
  // We distribute the total score roughly into the pillars for backward compatibility
  // or we can just return the total and mock the rest if the UI relies on them.
  // For now, let's keep the return type but maybe simplify the internal logic if strictly needed.
  // Actually, better to keep the pillars "alive" if possible or just mock them proportional to total.

  // MOCK BREAKDOWN (Since we moved to Quest System):
  // We simply divide the total score by 3 for the pillars visual only
  const pillarScore = Math.floor(totalScore / 3);

  return {
    total: totalScore,
    citizen: {
      total: pillarScore,
      walletAge: 0, // Deprecated detail
      transactionCount: 0
    },
    whale: {
      total: pillarScore,
      tradingVolume: 0,
      ethBalance: 0
    },
    explorer: {
      total: pillarScore,
      protocolDiversity: 0,
      identity: 0
    }
  };
}

/**
 * Get a simplified score (just the number) for backward compatibility
 */
export function getBaseScore(stats: WalletStats, ethBalance: number = 0): number {
  return calculateBaseScore(stats, ethBalance).total;
}

/**
 * Helper to calculate wallet age in months (exported for UI display)
 */
export function getWalletAgeMonths(firstTxDate: Date | null): number {
  if (!firstTxDate) return 0;
  const days = getWalletAgeDays(firstTxDate);
  return Math.floor(days / 30);
}

/**
 * Helper to calculate wallet age in days (exported for UI display)
 */
export function getWalletAgeDays(firstTxDate: Date | null): number {
  if (!firstTxDate) return 0;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - firstTxDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
