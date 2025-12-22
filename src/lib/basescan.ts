// BaseScan API Service - Using Etherscan API V2
// Single API key works across all EVM chains

import {
  BaseScanTransaction,
  BaseScanTokenTransfer,
  BaseScanResponse,
  WalletStats,
  ChecklistItem,
  Trade,
  TRACKED_PROTOCOLS,
} from '@/types';

import { calculateBaseScore, getBaseScore } from '@/utils/calculateScore';
import { formatPercentile, getPercentileEstimate } from '@/utils/getRankInfo';

// Base network endpoint (part of Etherscan API V2)
const BASESCAN_API = 'https://api.etherscan.io/v2/api';

// Get Etherscan API V2 key from environment
const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔑 Etherscan API V2 Key Status:', API_KEY ? '✓ Loaded' : '✗ Missing');
  console.log('📏 Key Length:', API_KEY.length, 'chars');
  console.log('🌐 API Endpoint:', BASESCAN_API);
}

// Get ETH balance for an address
async function getBalance(address: string): Promise<number> {
  try {
    const response = await fetch(
      `${BASESCAN_API}?chainid=8453&module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.status === '1' && data.result) {
      // Convert Wei to ETH
      return parseFloat(data.result) / 1e18;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
}

// Helper to make API calls with Etherscan API V2
async function fetchBaseScan<T>(params: Record<string, string>): Promise<T[]> {
  // Etherscan API V2 uses 'apikey' parameter and 'chainid'
  const searchParams = new URLSearchParams({
    chainid: '8453', // Base Mainnet
    ...params,
    apikey: API_KEY,
  });

  const url = `${BASESCAN_API}?${searchParams}`;

  console.log('🔍 API Call:', params.module + '.' + params.action);
  console.log('📍 URL:', url.replace(API_KEY, 'KEY_HIDDEN'));

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText);
      return [];
    }

    const data: BaseScanResponse<T> = await response.json();

    console.log('📊 Response:', {
      status: data.status,
      message: data.message,
      resultType: typeof data.result,
      resultCount: Array.isArray(data.result) ? data.result.length : 'N/A'
    });

    // Etherscan API V2 returns status "1" for success
    if (data.status === '1' && Array.isArray(data.result)) {
      console.log('✅ Success:', data.result.length, 'items');
      return data.result;
    }

    if (data.status === '0') {
      console.warn('⚠️ API Warning:', data.message);
      // "No transactions found" is normal for new wallets
      if (data.message === 'No transactions found') {
        console.log('ℹ️ Wallet has no transactions on Base network');
      }
    }

    return [];
  } catch (error) {
    console.error('❌ Fetch Error:', error);
    return [];
  }
}

// Get all transactions for an address
export async function getTransactions(address: string): Promise<BaseScanTransaction[]> {
  console.log('📥 Fetching transactions for:', address);

  const result = await fetchBaseScan<BaseScanTransaction>({
    module: 'account',
    action: 'txlist',
    address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '1000',
    sort: 'desc',
  });

  console.log(`✓ ${result.length} transactions retrieved`);
  return result;
}

// Get ERC-20 token transfers
export async function getTokenTransfers(address: string): Promise<BaseScanTokenTransfer[]> {
  console.log('📥 Fetching token transfers for:', address);

  const result = await fetchBaseScan<BaseScanTokenTransfer>({
    module: 'account',
    action: 'tokentx',
    address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '1000',
    sort: 'desc',
  });

  console.log(`✓ ${result.length} token transfers retrieved`);
  return result;
}

// Get ERC-721 NFT transfers
export async function getNFTTransfers(address: string): Promise<BaseScanTokenTransfer[]> {
  console.log('📥 Fetching NFT transfers for:', address);

  const result = await fetchBaseScan<BaseScanTokenTransfer>({
    module: 'account',
    action: 'tokennfttx',
    address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '500',
    sort: 'desc',
  });

  console.log(`✓ ${result.length} NFT transfers retrieved`);
  return result;
}

// Calculate wallet statistics
export function calculateWalletStats(
  transactions: BaseScanTransaction[],
  tokenTransfers: BaseScanTokenTransfer[],
  nftTransfers: BaseScanTokenTransfer[]
): WalletStats {
  console.log('📊 Calculating stats:', {
    txs: transactions.length,
    tokens: tokenTransfers.length,
    nfts: nftTransfers.length
  });

  // Handle empty wallet
  if (transactions.length === 0 && tokenTransfers.length === 0) {
    console.log('ℹ️ Empty wallet - no activity found');
    return {
      totalTransactions: 0,
      uniqueProtocols: 0,
      totalVolume: 0,
      firstTxDate: new Date(),
      daysActive: 0,
      gasSpent: 0,
      nftsMinted: 0,
      bridgeTransactions: 0,
    };
  }

  // Unique contracts
  const uniqueContracts = new Set(
    transactions
      .filter((tx) => tx.to && tx.to !== '')
      .map((tx) => tx.to.toLowerCase())
  );

  // Gas spent in ETH
  const gasSpent = transactions.reduce((acc, tx) => {
    const gasUsed = BigInt(tx.gasUsed || '0');
    const gasPrice = BigInt(tx.gasPrice || '0');
    return acc + (Number(gasUsed * gasPrice) / 1e18);
  }, 0);

  // Token transfer volume (simplified)
  const totalVolume = tokenTransfers.reduce((acc, transfer) => {
    const decimals = Number(transfer.tokenDecimal || 18);
    const value = Number(transfer.value) / Math.pow(10, decimals);
    return acc + value;
  }, 0);

  // First transaction date
  const allTxs = [...transactions, ...tokenTransfers].sort(
    (a, b) => Number(a.timeStamp) - Number(b.timeStamp)
  );
  const firstTxDate = allTxs.length > 0
    ? new Date(Number(allTxs[0].timeStamp) * 1000)
    : new Date();

  // Unique days active
  const uniqueDays = new Set(
    allTxs.map((tx) => {
      const date = new Date(Number(tx.timeStamp) * 1000);
      return date.toISOString().split('T')[0];
    })
  );

  // Bridge transactions
  const bridgeContracts = TRACKED_PROTOCOLS
    .filter((p) => p.category === 'bridge')
    .flatMap((p) => p.contracts.map((c) => c.toLowerCase()));

  const bridgeTransactions = transactions.filter((tx) =>
    bridgeContracts.includes(tx.to?.toLowerCase() || '')
  ).length;

  const stats = {
    totalTransactions: transactions.length + tokenTransfers.length,
    uniqueProtocols: uniqueContracts.size,
    totalVolume: Math.round(totalVolume * 100) / 100,
    firstTxDate,
    daysActive: uniqueDays.size,
    gasSpent: Math.round(gasSpent * 10000) / 10000,
    nftsMinted: nftTransfers.length,
    bridgeTransactions,
  };

  console.log('✅ Stats:', stats);
  return stats;
}

// Generate airdrop checklist
export function generateChecklist(
  transactions: BaseScanTransaction[],
  tokenTransfers: BaseScanTokenTransfer[],
  nftTransfers: BaseScanTokenTransfer[]
): ChecklistItem[] {
  console.log('📋 Generating checklist...');

  // Get all contract interactions
  const allContracts = new Set([
    ...transactions.map(tx => tx.to?.toLowerCase() || ''),
    ...tokenTransfers.map(tx => tx.contractAddress?.toLowerCase() || ''),
    ...nftTransfers.map(tx => tx.contractAddress?.toLowerCase() || ''),
  ]);

  const checklist: ChecklistItem[] = [];

  // Check each protocol
  for (const protocol of TRACKED_PROTOCOLS) {
    const hasInteracted = protocol.contracts.some(contract =>
      allContracts.has(contract.toLowerCase())
    );

    checklist.push({
      id: checklist.length + 1,
      task: `Use ${protocol.name}`,
      description: `Interact with ${protocol.name} on Base`,
      completed: hasInteracted,
      link: getProtocolUrl(protocol.name),
      points: 50,
    });
  }

  const completed = checklist.filter(item => item.completed).length;
  console.log(`✅ Checklist: ${completed}/${checklist.length} completed`);

  return checklist;
}

// Protocol URLs
function getProtocolUrl(name: string): string {
  const urls: Record<string, string> = {
    'Uniswap': 'https://app.uniswap.org',
    'Aerodrome': 'https://aerodrome.finance',
    'Aave': 'https://app.aave.com',
    'Compound': 'https://app.compound.finance',
    'Base Bridge': 'https://bridge.base.org',
    'Zora': 'https://zora.co',
    'Basename': 'https://www.base.org/names',
  };
  return urls[name] || 'https://base.org';
}

// Parse recent trades
export function parseRecentTrades(
  tokenTransfers: BaseScanTokenTransfer[],
  walletAddress: string
): Trade[] {
  console.log('💱 Parsing trades...');

  const trades: Trade[] = [];
  const now = Date.now();

  for (const transfer of tokenTransfers.slice(0, 20)) {
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

    const decimals = Number(transfer.tokenDecimal || 18);
    const amount = Number(transfer.value) / Math.pow(10, decimals);

    trades.push({
      hash: transfer.hash,
      token: transfer.tokenSymbol || 'Unknown',
      tokenAddress: transfer.contractAddress,
      type: isBuy ? 'buy' : 'sell',
      amount,
      amountUSD: 0,
      pnl: null,
      pnlPercent: null,
      timestamp,
      timeAgo,
    });
  }

  console.log(`✅ ${trades.length} trades parsed`);
  return trades.slice(0, 10);
}

// Main data fetching function
export async function fetchWalletData(address: string): Promise<{
  stats: WalletStats;
  checklist: ChecklistItem[];
  baseScore: number;
  percentile: number;
  recentTrades: Trade[];
}> {
  console.log('🚀 Starting wallet data fetch');
  console.log('📬 Address:', address);
  console.log('🔑 API Key present:', API_KEY ? 'YES' : 'NO');
  console.log('📡 Endpoint:', BASESCAN_API);

  if (!API_KEY) {
    console.error('❌ CRITICAL: No API key found!');
    console.error('Set NEXT_PUBLIC_BASESCAN_API_KEY in .env.local');
    console.error('Get key from: https://etherscan.io/myapikey');
  } else {
    console.log('--------------------------------------------------');
    console.log('🔍 Starting Data Fetch for:', address);
    console.log('🔑 API Key Loaded (Length):', API_KEY.length);
    console.log('--------------------------------------------------');
  }

  // Fetch all data in parallel
  console.log('⏳ Fetching data from Etherscan API V2...');

  const [transactions, tokenTransfers, nftTransfers] = await Promise.all([
    getTransactions(address),
    getTokenTransfers(address),
    getNFTTransfers(address),
  ]);

  console.log('✅ All API calls complete');

  // Fetch ETH balance
  const ethBalance = await getBalance(address);

  // Calculate everything
  const stats = calculateWalletStats(transactions, tokenTransfers, nftTransfers);
  const checklist = generateChecklist(transactions, tokenTransfers, nftTransfers);

  // NEW: Use 3-pillar scoring
  const scoreBreakdown = calculateBaseScore(stats, ethBalance);

  const baseScore = scoreBreakdown.total;

  // NEW: Dynamic percentile
  const percentile = getPercentileEstimate(baseScore);
  const recentTrades = parseRecentTrades(tokenTransfers, address);

  console.log('🎉 Wallet data ready!');
  console.log('📊 Summary:', { baseScore, percentile, txs: stats.totalTransactions });

  return {
    stats,
    checklist,
    baseScore,
    percentile,
    recentTrades,
  };
}