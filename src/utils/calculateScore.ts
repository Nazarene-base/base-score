import { WalletStats } from '@/types';

/**
 * BASE SCORE - 3-PILLAR REPUTATION SYSTEM
 * Total: 1000 points
 * 
 * PILLAR 1: CITIZEN (Loyalty) - 300 points
 *   - Wallet Age: 10pts per month since first tx (max 150pts = 15 months)
 *   - Transaction Count: 1pt per transaction (max 150pts = 150 txs)
 * 
 * PILLAR 2: WHALE (Wealth) - 300 points
 *   - Trading Volume: 1pt per $100 swapped (max 200pts = $20,000)
 *   - ETH Balance: 10pts per 0.1 ETH (max 100pts = 1 ETH)
 * 
 * PILLAR 3: EXPLORER (Action) - 400 points
 *   - Protocol Diversity: 50pts per unique protocol (max 300pts = 6 protocols)
 *   - Identity: Base name OR NFT on Base = 100pts
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
 * PILLAR 1: CITIZEN SCORE (Loyalty - 300pts)
 * - Wallet Age: 10pts per month (max 150pts = 15 months)
 * - Transaction Count: 1pt per tx (max 150pts = 150 txs)
 */
function calculateCitizenScore(stats: WalletStats): { total: number; walletAge: number; transactionCount: number } {
  // Wallet Age: 10pts per month, max 150pts
  const months = calculateWalletAgeMonths(stats.firstTxDate);
  const walletAgeScore = Math.min(months * 10, 150);
  
  // Transaction Count: 1pt per tx, max 150pts
  const transactionScore = Math.min(stats.totalTransactions, 150);
  
  return {
    total: walletAgeScore + transactionScore,
    walletAge: walletAgeScore,
    transactionCount: transactionScore
  };
}

/**
 * PILLAR 2: WHALE SCORE (Wealth - 300pts)
 * - Trading Volume: 1pt per $100 swapped (max 200pts = $20,000)
 * - ETH Balance: 10pts per 0.1 ETH (max 100pts = 1 ETH)
 */
function calculateWhaleScore(stats: WalletStats, ethBalance: number): { total: number; tradingVolume: number; ethBalance: number } {
  // Trading Volume: 1pt per $100, max 200pts ($20,000)
  const volumeInHundreds = Math.floor(stats.totalVolume / 100);
  const volumeScore = Math.min(volumeInHundreds, 200);
  
  // ETH Balance: 10pts per 0.1 ETH, max 100pts (1 ETH)
  const ethInTenths = Math.floor(ethBalance / 0.1);
  const balanceScore = Math.min(ethInTenths * 10, 100);
  
  return {
    total: volumeScore + balanceScore,
    tradingVolume: volumeScore,
    ethBalance: balanceScore
  };
}

/**
 * PILLAR 3: EXPLORER SCORE (Action - 400pts)
 * - Protocol Diversity: 50pts per unique protocol (max 300pts = 6 protocols)
 * - Identity: Base name OR NFT on Base = 100pts
 */
function calculateExplorerScore(stats: WalletStats): { total: number; protocolDiversity: number; identity: number } {
  // Protocol Diversity: 50pts each, max 300pts (6 protocols)
  const protocolScore = Math.min(stats.uniqueProtocols * 50, 300);
  
  // Identity: 100pts if has NFT on Base (includes Base names)
  // Note: stats.nftsMinted covers both regular NFTs and Base names
  const identityScore = stats.nftsMinted > 0 ? 100 : 0;
  
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
    total: Math.min(total, 1000), // Cap at 1000
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
