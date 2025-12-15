// BaseScan API Service
// Fetches transaction data from Base blockchain

import {
  BaseScanTransaction,
  BaseScanTokenTransfer,
  BaseScanResponse,
  WalletStats,
  ChecklistItem,
  Trade,
  TRACKED_PROTOCOLS,
} from '@/types';

const BASESCAN_API = 'https://api.basescan.org/api';
const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '';

// Helper to make API calls
async function fetchBaseScan<T>(params: Record<string, string>): Promise<T[]> {
  const searchParams = new URLSearchParams({
    ...params,
    apikey: API_KEY,
  });

  try {
    const response = await fetch(`${BASESCAN_API}?${searchParams}`);
    const data: BaseScanResponse<T> = await response.json();

    if (data.status === '1' && Array.isArray(data.result)) {
      return data.result;
    }
    return [];
  } catch (error) {
    console.error('BaseScan API error:', error);
    return [];
  }
}

// Get all transactions for an address
export async function getTransactions(address: string): Promise<BaseScanTransaction[]> {
  return fetchBaseScan<BaseScanTransaction>({
    module: 'account',
    action: 'txlist',
    address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '10000',
    sort: 'desc',
  });
}

// Get token transfers for an address
export async function getTokenTransfers(address: string): Promise<BaseScanTokenTransfer[]> {
  return fetchBaseScan<BaseScanTokenTransfer>({
    module: 'account',
    action: 'tokentx',
    address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '10000',
    sort: 'desc',
  });
}

// Get NFT transfers
export async function getNFTTransfers(address: string): Promise<BaseScanTokenTransfer[]> {
  return fetchBaseScan<BaseScanTokenTransfer>({
    module: 'account',
    action: 'tokennfttx',
    address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '1000',
    sort: 'desc',
  });
}

// Get ETH balance
export async function getBalance(address: string): Promise<string> {
  const result = await fetchBaseScan<string>({
    module: 'account',
    action: 'balance',
    address,
    tag: 'latest',
  });
  return Array.isArray(result) ? '0' : (result as unknown as string);
}

// Calculate wallet stats from transactions
export function calculateWalletStats(
  transactions: BaseScanTransaction[],
  tokenTransfers: BaseScanTokenTransfer[],
  nftTransfers: BaseScanTokenTransfer[]
): WalletStats {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      uniqueProtocols: 0,
      totalVolume: 0,
      firstTxDate: new Date().toISOString(),
      daysActive: 0,
      gasSpent: 0,
      nftsMinted: 0,
      bridgeTransactions: 0,
    };
  }

  // Get unique contracts interacted with
  const uniqueContracts = new Set(
    transactions
      .filter((tx) => tx.to && tx.to !== '')
      .map((tx) => tx.to.toLowerCase())
  );

  // Calculate gas spent in ETH
  const gasSpent = transactions.reduce((acc, tx) => {
    const gasUsed = BigInt(tx.gasUsed || '0');
    const gasPrice = BigInt(tx.gasPrice || '0');
    return acc + (Number(gasUsed * gasPrice) / 1e18);
  }, 0);

  // Calculate total volume from token transfers (simplified)
  const totalVolume = tokenTransfers.reduce((acc, transfer) => {
    // This is simplified - in production you'd want to fetch token prices
    const value = Number(transfer.value) / Math.pow(10, Number(transfer.tokenDecimal || 18));
    return acc + value;
  }, 0);

  // Get first transaction date
  const sortedTxs = [...transactions].sort(
    (a, b) => Number(a.timeStamp) - Number(b.timeStamp)
  );
  const firstTxDate = new Date(Number(sortedTxs[0].timeStamp) * 1000).toISOString();

  // Calculate unique days active
  const uniqueDays = new Set(
    transactions.map((tx) => {
      const date = new Date(Number(tx.timeStamp) * 1000);
      return date.toISOString().split('T')[0];
    })
  );

  // Count bridge transactions (simplified - check for bridge contract interactions)
  const bridgeContracts = TRACKED_PROTOCOLS
    .filter((p) => p.category === 'bridge')
    .flatMap((p) => p.contracts.map((c) => c.toLowerCase()));
  
  const bridgeTransactions = transactions.filter((tx) =>
    bridgeContracts.includes(tx.to?.toLowerCase() || '')
  ).length;

  // Count NFT mints (transfers where from is zero address)
  const nftsMinted = nftTransfers.filter(
    (transfer) => transfer.from === '0x0000000000000000000000000000000000000000'
  ).length;

  return {
    totalTransactions: transactions.length,
    uniqueProtocols: uniqueContracts.size,
    totalVolume: Math.round(totalVolume * 100) / 100,
    firstTxDate,
    daysActive: uniqueDays.size,
    gasSpent: Math.round(gasSpent * 10000) / 10000,
    nftsMinted,
    bridgeTransactions,
  };
}

// Generate checklist based on actual activity
export function generateChecklist(
  transactions: BaseScanTransaction[],
  tokenTransfers: BaseScanTokenTransfer[],
  nftTransfers: BaseScanTokenTransfer[]
): ChecklistItem[] {
  const contractsInteracted = new Set(
    transactions.map((tx) => tx.to?.toLowerCase() || '')
  );

  const hasInteractedWith = (contracts: string[]): boolean => {
    return contracts.some((c) => contractsInteracted.has(c.toLowerCase()));
  };

  const uniswap = TRACKED_PROTOCOLS.find((p) => p.name === 'Uniswap')!;
  const aerodrome = TRACKED_PROTOCOLS.find((p) => p.name === 'Aerodrome')!;
  const aave = TRACKED_PROTOCOLS.find((p) => p.name === 'Aave')!;
  const compound = TRACKED_PROTOCOLS.find((p) => p.name === 'Compound')!;
  const bridge = TRACKED_PROTOCOLS.find((p) => p.name === 'Base Bridge')!;
  const zora = TRACKED_PROTOCOLS.find((p) => p.name === 'Zora')!;
  const basename = TRACKED_PROTOCOLS.find((p) => p.name === 'Basename')!;

  // Check for LP provision (simplified - look for specific method signatures)
  const hasProvidedLiquidity = transactions.some(
    (tx) => tx.functionName?.toLowerCase().includes('addliquidity')
  );

  return [
    {
      id: 1,
      task: 'Swap on Uniswap',
      description: 'Complete a token swap on Uniswap',
      completed: hasInteractedWith(uniswap.contracts),
      link: 'https://app.uniswap.org',
      points: 50,
    },
    {
      id: 2,
      task: 'Swap on Aerodrome',
      description: 'Complete a token swap on Aerodrome',
      completed: hasInteractedWith(aerodrome.contracts),
      link: 'https://aerodrome.finance/swap',
      points: 50,
    },
    {
      id: 3,
      task: 'Provide Liquidity',
      description: 'Add liquidity to any DEX pool',
      completed: hasProvidedLiquidity,
      link: 'https://aerodrome.finance/liquidity',
      points: 100,
    },
    {
      id: 4,
      task: 'Mint an NFT',
      description: 'Mint any NFT on Base',
      completed: nftTransfers.some(
        (t) => t.from === '0x0000000000000000000000000000000000000000'
      ),
      link: 'https://zora.co',
      points: 50,
    },
    {
      id: 5,
      task: 'Use Base Bridge',
      description: 'Bridge assets to Base',
      completed: hasInteractedWith(bridge.contracts),
      link: 'https://bridge.base.org',
      points: 75,
    },
    {
      id: 6,
      task: 'Register Basename',
      description: 'Get your .base name',
      completed: hasInteractedWith(basename.contracts),
      link: 'https://www.base.org/names',
      points: 100,
    },
    {
      id: 7,
      task: 'Use Lending Protocol',
      description: 'Supply or borrow on Aave/Compound',
      completed: hasInteractedWith([...aave.contracts, ...compound.contracts]),
      link: 'https://app.aave.com/?marketName=proto_base_v3',
      points: 75,
    },
    {
      id: 8,
      task: '10+ Transactions',
      description: 'Complete at least 10 transactions',
      completed: transactions.length >= 10,
      link: null,
      points: 25,
    },
    {
      id: 9,
      task: '50+ Transactions',
      description: 'Complete at least 50 transactions',
      completed: transactions.length >= 50,
      link: null,
      points: 50,
    },
    {
      id: 10,
      task: 'Active 30+ Days',
      description: 'Be active on Base for over 30 days',
      completed: (() => {
        if (transactions.length === 0) return false;
        const sorted = [...transactions].sort(
          (a, b) => Number(a.timeStamp) - Number(b.timeStamp)
        );
        const firstTx = Number(sorted[0].timeStamp) * 1000;
        const daysSinceFirst = (Date.now() - firstTx) / (1000 * 60 * 60 * 24);
        return daysSinceFirst >= 30;
      })(),
      link: null,
      points: 100,
    },
  ];
}

// Calculate Base Score from stats and checklist
export function calculateBaseScore(
  stats: WalletStats,
  checklist: ChecklistItem[]
): { score: number; percentile: number } {
  let score = 0;

  // Points from checklist (max 675 points)
  const checklistPoints = checklist
    .filter((item) => item.completed)
    .reduce((acc, item) => acc + item.points, 0);
  score += checklistPoints;

  // Points from transaction count (max 100 points)
  score += Math.min(stats.totalTransactions / 5, 100);

  // Points from unique protocols (max 75 points)
  score += Math.min(stats.uniqueProtocols * 5, 75);

  // Points from days active (max 50 points)
  score += Math.min(stats.daysActive, 50);

  // Points from volume (max 100 points) - simplified
  score += Math.min(stats.totalVolume / 100, 100);

  // Cap at 1000
  score = Math.min(Math.round(score), 1000);

  // Estimate percentile (simplified - in production you'd compare against all users)
  const percentile = Math.min(Math.round((score / 1000) * 100), 99);

  return { score, percentile };
}

// Parse recent trades from token transfers
export function parseRecentTrades(
  tokenTransfers: BaseScanTokenTransfer[],
  walletAddress: string
): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();

  // Get last 10 token transfers that look like trades
  const recentTransfers = tokenTransfers.slice(0, 20);

  for (const transfer of recentTransfers) {
    const isBuy = transfer.to.toLowerCase() === walletAddress.toLowerCase();
    const timestamp = Number(transfer.timeStamp) * 1000;
    const timeDiff = now - timestamp;

    let timeAgo = '';
    if (timeDiff < 3600000) {
      timeAgo = `${Math.floor(timeDiff / 60000)}m ago`;
    } else if (timeDiff < 86400000) {
      timeAgo = `${Math.floor(timeDiff / 3600000)}h ago`;
    } else {
      timeAgo = `${Math.floor(timeDiff / 86400000)}d ago`;
    }

    trades.push({
      hash: transfer.hash,
      token: transfer.tokenSymbol || 'Unknown',
      tokenAddress: transfer.contractAddress,
      type: isBuy ? 'buy' : 'sell',
      amount: Number(transfer.value) / Math.pow(10, Number(transfer.tokenDecimal || 18)),
      amountUSD: 0, // Would need price API
      pnl: null, // Would need to track buy/sell pairs
      pnlPercent: null,
      timestamp,
      timeAgo,
    });
  }

  return trades.slice(0, 10);
}

// Main function to fetch all wallet data
export async function fetchWalletData(address: string): Promise<{
  stats: WalletStats;
  checklist: ChecklistItem[];
  baseScore: number;
  percentile: number;
  recentTrades: Trade[];
}> {
  // Fetch all data in parallel
  const [transactions, tokenTransfers, nftTransfers] = await Promise.all([
    getTransactions(address),
    getTokenTransfers(address),
    getNFTTransfers(address),
  ]);

  // Calculate stats
  const stats = calculateWalletStats(transactions, tokenTransfers, nftTransfers);

  // Generate checklist
  const checklist = generateChecklist(transactions, tokenTransfers, nftTransfers);

  // Calculate score
  const { score, percentile } = calculateBaseScore(stats, checklist);

  // Parse recent trades
  const recentTrades = parseRecentTrades(tokenTransfers, address);

  return {
    stats,
    checklist,
    baseScore: score,
    percentile,
    recentTrades,
  };
}
