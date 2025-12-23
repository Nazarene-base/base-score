import { WalletStats } from '@/types';

/**
 * BASE SCORE - WEIGHTED REPUTATION ALGORITHM (0-1000)
 * 
 * Categories:
 * - OG Status (25% = 250 pts): Time-based metrics you can't buy
 * - DeFi Mastery (25% = 250 pts): Time-weighted volume & activity
 * - Culture & Identity (20% = 200 pts): Base-native signals
 * - Network Contribution (15% = 150 pts): Gas spent, voting
 * - Protocol Diversity (15% = 150 pts): Ecosystem breadth
 */

// ============================================
// TYPES
// ============================================

export interface ScoreBreakdown {
  total: number;
  ogStatus: {
    total: number;
    walletAge: number;
    daysActive: number;
    activityStreak: number;
  };
  defiMastery: {
    total: number;
    timeWeightedVolume: number;
    dexActivity: number;
    lendingActivity: number;
    bridgeActivity: number;
  };
  culture: {
    total: number;
    basename: number;
    nftActivity: number;
    farcaster: number;
    farcasterConnected: number;
    farcasterAge: number;
    farcasterFollowers: number;
  };
  network: {
    total: number;
    gasSpent: number;
    // daoVoting: number; // Future
  };
  diversity: {
    total: number;
    uniqueProtocols: number;
    crossCategory: number;
  };
  penalties: {
    total: number;
    freshWhalePenalty: number;
    lowDiversityPenalty: number;
  };
}

// ============================================
// SCORING CONSTANTS
// ============================================

const WEIGHTS = {
  OG_STATUS: 250,      // 25%
  DEFI_MASTERY: 250,   // 25%
  CULTURE: 200,        // 20%
  NETWORK: 150,        // 15%
  DIVERSITY: 150,      // 15%
};

// Sub-weights within categories (sum to category max)
const OG_WEIGHTS = {
  WALLET_AGE: 80,       // 5 pts/month, max 12 months
  DAYS_ACTIVE: 100,     // 0.55 pts/day, max 180 days
  ACTIVITY_STREAK: 70,  // Consistent weekly activity
};

const DEFI_WEIGHTS = {
  TIME_WEIGHTED_VOLUME: 100,  // sqrt(volume * days / 10000)
  DEX_ACTIVITY: 60,           // Unique swaps
  LENDING_ACTIVITY: 50,       // Lending protocol usage
  BRIDGE_ACTIVITY: 40,        // Bridge transactions
};

const CULTURE_WEIGHTS = {
  BASENAME: 50,         // Owning a .base.eth name
  NFT_ACTIVITY: 50,     // NFT minting/holding
  FARCASTER_CONNECTED: 25, // Having a Farcaster account linked
  FARCASTER_AGE: 25,    // 2 pts/month, max 24 pts
  FARCASTER_FOLLOWERS: 50, // log10(followers) * 12.5, max 50 pts
};

const NETWORK_WEIGHTS = {
  GAS_SPENT: 150,       // Network contribution via fees
};

const DIVERSITY_WEIGHTS = {
  UNIQUE_PROTOCOLS: 90,  // Different contracts interacted
  CROSS_CATEGORY: 60,    // DEX + NFT + Lending + Bridge
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate wallet age in months (capped at 12 for scoring)
 */
export function getWalletAgeMonths(firstTxDate: Date | null): number {
  if (!firstTxDate) return 0;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - firstTxDate.getTime());
  const months = diffTime / (1000 * 60 * 60 * 24 * 30);
  return Math.min(12, months); // Cap at 12 months for scoring
}

/**
 * Calculate wallet age in days
 */
export function getWalletAgeDays(firstTxDate: Date | null): number {
  if (!firstTxDate) return 0;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - firstTxDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Time-Weighted Volume Formula
 * Prevents instant whale gaming - rewards consistency over time
 * Formula: sqrt(volume_usd * days_since_first_tx / 10000)
 */
function calculateTimeWeightedVolume(volume: number, daysActive: number): number {
  if (volume <= 0 || daysActive <= 0) return 0;
  const twv = Math.sqrt((volume * daysActive) / 10000);
  return Math.min(100, twv); // Cap at 100 for scoring
}

/**
 * Diminishing returns for high values
 * Prevents whales from dominating through sheer volume
 */
function diminishingReturns(value: number, scale: number = 1, maxPoints: number = 100): number {
  if (value <= 0) return 0;
  // Log scale gives diminishing returns
  const score = Math.log10(value * scale + 1) * 20;
  return Math.min(maxPoints, score);
}

// ============================================
// MAIN SCORING FUNCTION
// ============================================

/**
 * Calculate comprehensive Base Score (0-1000)
 */
export function calculateBaseScore(stats: WalletStats, ethBalance: number = 0): ScoreBreakdown {
  const daysActive = stats.daysActive || 0;
  const walletAgeMonths = getWalletAgeMonths(stats.firstTxDate);
  const walletAgeDays = getWalletAgeDays(stats.firstTxDate);

  // ==========================================
  // 1. OG STATUS (250 pts max)
  // ==========================================

  // Wallet Age: 5 pts/month, max 60 pts for 12 months
  const walletAgeScore = Math.min(OG_WEIGHTS.WALLET_AGE, walletAgeMonths * (OG_WEIGHTS.WALLET_AGE / 12));

  // Days Active: 0.55 pts/day, max 100 pts for 180 days
  const daysActiveScore = Math.min(OG_WEIGHTS.DAYS_ACTIVE, daysActive * (OG_WEIGHTS.DAYS_ACTIVE / 180));

  // Activity Streak: Based on consistency (approximated from daysActive vs age ratio)
  const activityRatio = walletAgeDays > 0 ? daysActive / Math.min(walletAgeDays, 365) : 0;
  const activityStreakScore = Math.min(OG_WEIGHTS.ACTIVITY_STREAK, activityRatio * OG_WEIGHTS.ACTIVITY_STREAK);

  const ogStatusTotal = Math.floor(walletAgeScore + daysActiveScore + activityStreakScore);

  // ==========================================
  // 2. DEFI MASTERY (250 pts max)
  // ==========================================

  // Time-Weighted Volume
  const twvScore = calculateTimeWeightedVolume(stats.totalVolume, daysActive);
  const timeWeightedVolumeScore = Math.min(DEFI_WEIGHTS.TIME_WEIGHTED_VOLUME, twvScore);

  // DEX Activity
  const dexActivityScore = stats.hasDexActivity ? DEFI_WEIGHTS.DEX_ACTIVITY : 0;

  // Lending Activity
  const lendingActivityScore = stats.hasLendingActivity ? DEFI_WEIGHTS.LENDING_ACTIVITY : 0;

  // Bridge Activity
  const bridgeScore = Math.min(
    DEFI_WEIGHTS.BRIDGE_ACTIVITY,
    stats.bridgeTransactions * 10
  );

  const defiMasteryTotal = Math.floor(
    timeWeightedVolumeScore + dexActivityScore + lendingActivityScore + bridgeScore
  );

  // ==========================================
  // 3. CULTURE & IDENTITY (200 pts max)
  // ==========================================

  // Basename ownership
  const basenameScore = stats.basename ? CULTURE_WEIGHTS.BASENAME : 0;

  // NFT Activity
  const nftScore = stats.hasNftActivity
    ? Math.min(CULTURE_WEIGHTS.NFT_ACTIVITY, 20 + (stats.nftsMinted * 3))
    : 0;

  // Farcaster Integration
  let farcasterConnectedScore = 0;
  let farcasterAgeScore = 0;
  let farcasterFollowersScore = 0;
  let farcasterTotalScore = 0;

  if (stats.farcaster) {
    // Connected: 25 pts flat
    farcasterConnectedScore = CULTURE_WEIGHTS.FARCASTER_CONNECTED;

    // Account Age: 2 pts/month, max 25 pts
    farcasterAgeScore = Math.min(CULTURE_WEIGHTS.FARCASTER_AGE, stats.farcaster.accountAge * 2);

    // Followers: log10(followers) * 12.5, max 50 pts
    // 10 followers = 12.5 pts, 100 = 25 pts, 1000 = 37.5 pts, 10000 = 50 pts
    farcasterFollowersScore = stats.farcaster.followerCount > 0
      ? Math.min(CULTURE_WEIGHTS.FARCASTER_FOLLOWERS, Math.log10(stats.farcaster.followerCount) * 12.5)
      : 0;

    farcasterTotalScore = farcasterConnectedScore + farcasterAgeScore + farcasterFollowersScore;
  }

  const cultureTotal = Math.floor(basenameScore + nftScore + farcasterTotalScore);

  // ==========================================
  // 4. NETWORK CONTRIBUTION (150 pts max)
  // ==========================================

  // Gas Spent: Log scale, 1 ETH = ~100 pts
  const gasScore = diminishingReturns(stats.gasSpent, 100, NETWORK_WEIGHTS.GAS_SPENT);

  const networkTotal = Math.floor(gasScore);

  // ==========================================
  // 5. PROTOCOL DIVERSITY (150 pts max)
  // ==========================================

  // Unique Protocols: 5 pts each, max 90 pts
  const uniqueProtocolsScore = Math.min(
    DIVERSITY_WEIGHTS.UNIQUE_PROTOCOLS,
    stats.uniqueProtocols * 5
  );

  // Cross-Category: 15 pts for each category used
  let categoriesUsed = 0;
  if (stats.hasDexActivity) categoriesUsed++;
  if (stats.hasNftActivity) categoriesUsed++;
  if (stats.hasLendingActivity) categoriesUsed++;
  if (stats.bridgeTransactions > 0) categoriesUsed++;

  const crossCategoryScore = Math.min(
    DIVERSITY_WEIGHTS.CROSS_CATEGORY,
    categoriesUsed * 15
  );

  const diversityTotal = Math.floor(uniqueProtocolsScore + crossCategoryScore);

  // ==========================================
  // 6. ANTI-SYBIL PENALTIES
  // ==========================================

  let freshWhalePenalty = 0;
  let lowDiversityPenalty = 0;

  // Fresh Whale Penalty: High volume + low age
  if (stats.totalVolume > 10000 && walletAgeDays < 7) {
    // Cap score at 300 for fresh high-volume wallets
    freshWhalePenalty = Math.max(0, ogStatusTotal + defiMasteryTotal + cultureTotal + networkTotal + diversityTotal - 300);
  }

  // Low Diversity Penalty: Lots of tx but few unique protocols
  if (stats.totalTransactions > 100 && stats.uniqueProtocols < 5) {
    lowDiversityPenalty = 50; // -50 pts for suspicious pattern
  }

  const totalPenalties = freshWhalePenalty + lowDiversityPenalty;

  // ==========================================
  // FINAL SCORE
  // ==========================================

  const rawTotal = ogStatusTotal + defiMasteryTotal + cultureTotal + networkTotal + diversityTotal;
  const finalTotal = Math.max(0, Math.min(1000, rawTotal - totalPenalties));

  return {
    total: Math.floor(finalTotal),
    ogStatus: {
      total: Math.min(WEIGHTS.OG_STATUS, ogStatusTotal),
      walletAge: Math.floor(walletAgeScore),
      daysActive: Math.floor(daysActiveScore),
      activityStreak: Math.floor(activityStreakScore),
    },
    defiMastery: {
      total: Math.min(WEIGHTS.DEFI_MASTERY, defiMasteryTotal),
      timeWeightedVolume: Math.floor(timeWeightedVolumeScore),
      dexActivity: Math.floor(dexActivityScore),
      lendingActivity: Math.floor(lendingActivityScore),
      bridgeActivity: Math.floor(bridgeScore),
    },
    culture: {
      total: Math.min(WEIGHTS.CULTURE, cultureTotal),
      basename: Math.floor(basenameScore),
      nftActivity: Math.floor(nftScore),
      farcaster: Math.floor(farcasterTotalScore),
      farcasterConnected: Math.floor(farcasterConnectedScore),
      farcasterAge: Math.floor(farcasterAgeScore),
      farcasterFollowers: Math.floor(farcasterFollowersScore),
    },
    network: {
      total: Math.min(WEIGHTS.NETWORK, networkTotal),
      gasSpent: Math.floor(gasScore),
    },
    diversity: {
      total: Math.min(WEIGHTS.DIVERSITY, diversityTotal),
      uniqueProtocols: Math.floor(uniqueProtocolsScore),
      crossCategory: Math.floor(crossCategoryScore),
    },
    penalties: {
      total: Math.floor(totalPenalties),
      freshWhalePenalty: Math.floor(freshWhalePenalty),
      lowDiversityPenalty: Math.floor(lowDiversityPenalty),
    },
  };
}

/**
 * Get simplified score (just the number)
 */
export function getBaseScore(stats: WalletStats, ethBalance: number = 0): number {
  return calculateBaseScore(stats, ethBalance).total;
}
