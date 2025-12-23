/**
 * BASE SCORE TIER SYSTEM (0-1000)
 * 
 * Tiers designed for psychological motivation:
 * - Newcomer (0-200): New to Base, getting started
 * - Builder (201-500): Active participant, building reputation
 * - Native (501-800): Established Base user with strong reputation
 * - Governor (801-1000): Elite tier, top 3% of Base users
 */

export type RankTier = 'Newcomer' | 'Builder' | 'Native' | 'Governor';

export interface RankInfo {
  tier: RankTier;
  label: string;
  description: string;
  color: string;
  gradient: string;
  bgColor: string;
  minScore: number;
  maxScore: number;
  emoji: string;
}

const RANK_TIERS: Record<RankTier, RankInfo> = {
  Newcomer: {
    tier: 'Newcomer',
    label: 'Newcomer',
    description: 'New to Base, getting started',
    color: '#6b7280', // gray
    gradient: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-500/10',
    minScore: 0,
    maxScore: 200,
    emoji: '🌱'
  },
  Builder: {
    tier: 'Builder',
    label: 'Builder',
    description: 'Active participant, building reputation',
    color: '#3b82f6', // blue
    gradient: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-500/10',
    minScore: 201,
    maxScore: 500,
    emoji: '🔨'
  },
  Native: {
    tier: 'Native',
    label: 'Native',
    description: 'Established Base user with strong reputation',
    color: '#8b5cf6', // violet
    gradient: 'from-violet-400 to-violet-600',
    bgColor: 'bg-violet-500/10',
    minScore: 501,
    maxScore: 800,
    emoji: '⚡'
  },
  Governor: {
    tier: 'Governor',
    label: 'Governor',
    description: 'Elite tier, top 3% of Base users',
    color: '#f59e0b', // amber/gold
    gradient: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-500/10',
    minScore: 801,
    maxScore: 1000,
    emoji: '👑'
  }
};

/**
 * Get rank info based on score (0-1000)
 */
export function getRankInfo(score: number): RankInfo {
  if (score <= 200) return RANK_TIERS.Newcomer;
  if (score <= 500) return RANK_TIERS.Builder;
  if (score <= 800) return RANK_TIERS.Native;
  return RANK_TIERS.Governor;
}

/**
 * Get next rank info (for progress tracking)
 */
export function getNextRank(currentScore: number): RankInfo | null {
  if (currentScore <= 200) return RANK_TIERS.Builder;
  if (currentScore <= 500) return RANK_TIERS.Native;
  if (currentScore <= 800) return RANK_TIERS.Governor;
  return null; // Already at max rank
}

/**
 * Calculate progress to next rank (0-100%)
 */
export function getProgressToNextRank(score: number): number {
  const currentRank = getRankInfo(score);
  const nextRank = getNextRank(score);

  if (!nextRank) return 100; // Already at max rank

  const rangeSize = nextRank.minScore - currentRank.minScore;
  const progress = score - currentRank.minScore;

  return Math.min(Math.round((progress / rangeSize) * 100), 100);
}

/**
 * Get points needed for next rank
 */
export function getPointsToNextRank(score: number): number {
  const nextRank = getNextRank(score);

  if (!nextRank) return 0; // Already at max rank

  return Math.max(nextRank.minScore - score, 0);
}

/**
 * Get all rank tiers (for UI display)
 */
export function getAllRanks(): RankInfo[] {
  return Object.values(RANK_TIERS);
}

/**
 * Format percentile for display
 */
export function formatPercentile(percentile: number): string {
  if (percentile >= 99) return 'Top 1%';
  if (percentile >= 95) return `Top ${100 - percentile}%`;
  return `Top ${Math.round(100 - percentile)}%`;
}

/**
 * Estimate percentile from score (0-1000 scale)
 * Based on expected distribution:
 * - Newcomer (0-200): ~40% of users
 * - Builder (201-500): ~35% of users
 * - Native (501-800): ~20% of users
 * - Governor (801-1000): ~5% of users
 */
export function getPercentileEstimate(score: number): number {
  if (score <= 200) {
    // Newcomer tier: 0-40th percentile
    return Math.floor((score / 200) * 40);
  } else if (score <= 500) {
    // Builder tier: 40-75th percentile
    return Math.floor(40 + ((score - 200) / 300) * 35);
  } else if (score <= 800) {
    // Native tier: 75-95th percentile
    return Math.floor(75 + ((score - 500) / 300) * 20);
  } else {
    // Governor tier: 95-100th percentile
    return Math.floor(95 + ((score - 800) / 200) * 5);
  }
}

/**
 * Get percentile message for display
 */
export function getPercentileMessage(score: number): string {
  const percentile = getPercentileEstimate(score);

  if (percentile >= 95) return "Top 5% — Elite status 🏆";
  if (percentile >= 75) return `Top ${100 - percentile}% — Strong reputation`;
  if (percentile >= 40) return `Ahead of ${percentile}% of Base wallets`;
  if (percentile >= 20) return "Building momentum...";
  return "Just getting started — keep building!";
}
