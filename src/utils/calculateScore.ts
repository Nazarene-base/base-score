import { WalletStats } from '@/types';

/**
 * BASE SCORE - 3-PILLAR REPUTATION SYSTEM
 * Total: 100 points
 * 
 * PILLAR 1: CITIZEN (Loyalty) - 30 points
 *   - Wallet Age: 1pt per month (max 15pts = 15 months)
 *   - Transaction Count: 1pt per 5 transactions (max 15pts = 75 txs)
 * 
 * PILLAR 2: WHALE (Wealth) - 30 points
 *   - Trading Volume: 1pt per $1000 swapped (max 20pts = $20,000)
 *   - ETH Balance: 1pt per 0.1 ETH (max 10pts = 1 ETH)
 * 
 * PILLAR 3: EXPLORER (Action) - 40 points
 *   - Protocol Diversity: 5pts per unique protocol (max 30pts = 6 protocols)
 *   - Identity: Base name OR NFT on Base = 10pts
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
 * Calculate days since first transaction
 */
function calculateWalletAgeDays(firstTxDate: Date | null): number {
  if (!firstTxDate) return 0;

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - firstTxDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Calculate months since first transaction
 */
function calculateWalletAgeMonths(firstTxDate: Date | null): number {
  if (!firstTxDate) return 0;

  const days = calculateWalletAgeDays(firstTxDate);
  const months = Math.floor(days / 30);

  return months;
}

/**
 * PILLAR 1: CITIZEN SCORE (Loyalty - 30pts)
 * - Wallet Age: 1pt per month (max 15pts = 15 months)
 * - Transaction Count: 1pt per 5 txs (max 15pts = 75 txs)
 */
function calculateCitizenScore(stats: WalletStats): { total: number; walletAge: number; transactionCount: number } {
  // Wallet Age: 1pt per month, max 15pts
  const months = calculateWalletAgeMonths(stats.firstTxDate);
  const walletAgeScore = Math.min(months, 15);

  // Transaction Count: 1pt per 5 txs, max 15pts
  const transactionScore = Math.min(Math.floor(stats.totalTransactions / 5), 15);

  return {
    total: walletAgeScore + transactionScore,
    walletAge: walletAgeScore,
    transactionCount: transactionScore
  };
}

/**
 * PILLAR 2: WHALE SCORE (Wealth - 30pts)
 * - Trading Volume: 1pt per $1000 swapped (max 20pts = $20,000)
 * - ETH Balance: 1pt per 0.1 ETH (max 10pts = 1 ETH)
 */
function calculateWhaleScore(stats: WalletStats, ethBalance: number): { total: number; tradingVolume: number; ethBalance: number } {
  // Trading Volume: 1pt per $1000, max 20pts ($20,000)
  const volumeInThousands = Math.floor(stats.totalVolume / 1000);
  const volumeScore = Math.min(volumeInThousands, 20);

  // ETH Balance: 1pt per 0.1 ETH, max 10pts (1 ETH)
  const ethInTenths = Math.floor(ethBalance / 0.1);
  const balanceScore = Math.min(ethInTenths, 10);

  return {
    total: volumeScore + balanceScore,
    tradingVolume: volumeScore,
    ethBalance: balanceScore
  };
}

/**
 * PILLAR 3: EXPLORER SCORE (Action - 40pts)
 * - Protocol Diversity: 5pts per unique protocol (max 30pts = 6 protocols)
 * - Identity: Base name OR NFT on Base = 10pts
 */
function calculateExplorerScore(stats: WalletStats): { total: number; protocolDiversity: number; identity: number } {
  // Protocol Diversity: 5pts each, max 30pts (6 protocols)
  const protocolScore = Math.min(stats.uniqueProtocols * 5, 30);

  // Identity: 10pts if has NFT on Base (includes Base names)
  // Note: stats.nftsMinted covers both regular NFTs and Base names
  const identityScore = (stats.nftsMinted > 0 || stats.basename) ? 10 : 0;

  return {
    total: protocolScore + identityScore,
    protocolDiversity: protocolScore,
    identity: identityScore
  };
}

/**
 * Main scoring function - calculates total Base Score with breakdown
 */
export function calculateBaseScore(stats: WalletStats, ethBalance: number = 0): ScoreBreakdown {
  const citizen = calculateCitizenScore(stats);
  const whale = calculateWhaleScore(stats, ethBalance);
  const explorer = calculateExplorerScore(stats);

  const total = citizen.total + whale.total + explorer.total;

  return {
    total: Math.min(total, 100), // Cap at 100
    citizen,
    whale,
    explorer
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
  return calculateWalletAgeMonths(firstTxDate);
}

/**
 * Helper to calculate wallet age in days (exported for UI display)
 */
export function getWalletAgeDays(firstTxDate: Date | null): number {
  return calculateWalletAgeDays(firstTxDate);
}
