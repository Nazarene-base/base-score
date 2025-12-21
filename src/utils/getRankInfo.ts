/**
 * BASE SCORE RANK SYSTEM
 * 
 * Ranks based on total score (0-1000):
 * - Newcomer (0-200): New to Base, getting started
 * - Builder (201-500): Active participant, building reputation
 * - Native (501-800): Established Base user with strong reputation
 * - Governor (801-1000): Elite tier, top 1% of Base users
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
    color: '#64748b', // slate
    gradient: 'from-slate-400 to-slate-600',
    bgColor: 'bg-slate-500/10',
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
    description: 'Elite tier, top 1% of Base users',
    color: '#f59e0b', // amber/gold
    gradient: 'from-amber-400 to-amber-600',
    bgColor: 'bg-amber-500/10',
    minScore: 801,
    maxScore: 1000,
    emoji: '👑'
  }
};

/**
 * Get rank info based on score
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
  return [
    RANK_TIERS.Newcomer,
    RANK_TIERS.Builder,
    RANK_TIERS.Native,
    RANK_TIERS.Governor
  ];
}

/**
 * Check if score qualifies for a specific rank
 */
export function hasRank(score: number, tier: RankTier): boolean {
  const rank = RANK_TIERS[tier];
  return score >= rank.minScore && score <= rank.maxScore;
}

/**
 * Get percentile estimate based on score
 * This is a rough approximation - in production you'd calculate this from actual user distribution
 */
export function getPercentileEstimate(score: number): number {
  // Rough distribution assumptions:
  // Newcomer (0-200): Bottom 40%
  // Builder (201-500): 40-80% (middle 40%)
  // Native (501-800): 80-99% (top 19%)
  // Governor (801-1000): Top 1%
  
  if (score <= 200) {
    // Linear interpolation in bottom 40%
    return Math.round((score / 200) * 40);
  } else if (score <= 500) {
    // Linear interpolation in middle 40% (40-80%)
    const progress = (score - 201) / 299;
    return Math.round(40 + (progress * 40));
  } else if (score <= 800) {
    // Linear interpolation in top 19% (80-99%)
    const progress = (score - 501) / 299;
    return Math.round(80 + (progress * 19));
  } else {
    // Top 1% (99-100%)
    const progress = (score - 801) / 199;
    return Math.round(99 + progress);
  }
}

/**
 * Format percentile for display (e.g., "Top 5.2%")
 */
export function formatPercentile(score: number): string {
  const percentile = getPercentileEstimate(score);
  const topPercentile = 100 - percentile;
  
  if (topPercentile <= 1) {
    return 'Top 1%';
  } else if (topPercentile <= 5) {
    return `Top ${topPercentile.toFixed(1)}%`;
  } else {
    return `Top ${Math.round(topPercentile)}%`;
  }
}
