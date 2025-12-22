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

// L-3 FIX: Only import what's used in this file
import { getTokenPrices } from './price';
import { getBasename } from './basename';

// Base network endpoint (part of Etherscan API V2)
const BASESCAN_API = 'https://api.etherscan.io/v2/api';

// Get Etherscan API V2 key from environment
const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '';

// M-5 FIX: Conditional debug logging (only in development)
const isDev = process.env.NODE_ENV === 'development';

function log(...args: any[]) {
  if (isDev) console.log(...args);
}

function logWarn(...args: any[]) {
  if (isDev) console.warn(...args);
}

function logError(...args: any[]) {
  console.error(...args); // Always log errors
}

// Debug logging (development only)
if (typeof window !== 'undefined' && isDev) {
  log('🔑 Etherscan API V2 Key Status:', API_KEY ? '✓ Loaded' : '✗ Missing');
  log('🌐 API Endpoint:', BASESCAN_API);
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

// Get all transactions for an address (multi-page, up to 5000)
// Returns { transactions, isApproximate } where isApproximate=true if we hit the limit
export async function getTransactions(address: string): Promise<{ data: BaseScanTransaction[], isApproximate: boolean }> {
  console.log('📥 Fetching transactions (multi-page) for:', address);

  const MAX_PAGES = 5;
  const PAGE_SIZE = 1000;
  let allTransactions: BaseScanTransaction[] = [];
  let isApproximate = false;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await fetchBaseScan<BaseScanTransaction>({
      module: 'account',
      action: 'txlist',
      address,
      startblock: '0',
      endblock: '99999999',
      page: String(page),
      offset: String(PAGE_SIZE),
      sort: 'desc',
    });

    allTransactions = [...allTransactions, ...result];
    console.log(`📄 Page ${page}: ${result.length} transactions`);

    // If we got fewer than PAGE_SIZE, we've reached the end
    if (result.length < PAGE_SIZE) {
      break;
    }

    // If we fetched all pages and still getting full pages, data is approximate
    if (page === MAX_PAGES && result.length === PAGE_SIZE) {
      isApproximate = true;
      console.log('⚠️ Wallet has >5000 transactions - data is approximate');
    }
  }

  console.log(`✓ Total: ${allTransactions.length} transactions${isApproximate ? ' (approximate)' : ''}`);
  return { data: allTransactions, isApproximate };
}

// NEW: Get ONLY the first (oldest) transaction for accurate wallet age
// This uses sort=asc and offset=1 to get exactly one result - the first ever tx
export async function fetchFirstTransactionDate(address: string): Promise<Date | null> {
  console.log('📅 Fetching first transaction date for:', address);

  const result = await fetchBaseScan<BaseScanTransaction>({
    module: 'account',
    action: 'txlist',
    address,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '1',  // Only fetch 1 transaction
    sort: 'asc',  // Oldest first
  });

  if (result.length > 0 && result[0].timeStamp) {
    const timestamp = parseInt(result[0].timeStamp, 10);
    const date = new Date(timestamp * 1000);
    console.log('✅ First transaction date:', date.toISOString());
    return date;
  }

  console.log('ℹ️ No transactions found - wallet is new');
  return null;
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
  nftTransfers: BaseScanTokenTransfer[],
  tokenPrices: Record<string, number> = {},
  // Authoritative values passed from caller
  authoritativeTxCount?: number,
  authoritativeFirstTxDate?: Date | null,
  ethBalance: number = 0 // NEW: For Level checks
): WalletStats {
  console.log('📊 Calculating stats:', {
    txs: transactions.length,
    tokens: tokenTransfers.length,
    nfts: nftTransfers.length,
    authTx: authoritativeTxCount,
    authDate: authoritativeFirstTxDate
  });

  // Unique contracts
  const uniqueContracts = new Set(
    transactions
      .filter((tx) => tx.to && tx.to !== '')
      .map((tx) => tx.to.toLowerCase())
  );

  // Gas spent in ETH - M-1 FIX: Safe BigInt parsing
  const gasSpent = transactions.reduce((acc, tx) => {
    try {
      const gasUsed = BigInt(tx.gasUsed || '0');
      const gasPrice = BigInt(tx.gasPrice || '0');
      return acc + (Number(gasUsed * gasPrice) / 1e18);
    } catch {
      return acc; // Skip malformed data
    }
  }, 0);

  // Calculate Volume with Real Prices
  const wethPrice = tokenPrices['0x4200000000000000000000000000000000000006'] || 2500;
  const ethVolume = transactions.reduce((acc, tx) => {
    return acc + (Number(tx.value) / 1e18);
  }, 0);
  const ethVolumeUSD = ethVolume * wethPrice;

  // Token Transfers - M-2 FIX: Cap decimals to prevent overflow
  const tokenVolumeUSD = tokenTransfers.reduce((acc, transfer) => {
    const contractAddr = transfer.contractAddress?.toLowerCase();
    const price = tokenPrices[contractAddr] || 0;
    if (!price) return acc;
    const decimals = Math.min(Number(transfer.tokenDecimal || 18), 18); // Cap at 18
    if (transfer.value.length > 30) return acc; // Safety check
    const valueObj = Number(transfer.value) / Math.pow(10, decimals);
    if (!isFinite(valueObj)) return acc; // Skip if overflow
    return acc + (valueObj * price);
  }, 0);

  const totalVolume = ethVolumeUSD + tokenVolumeUSD;

  // First transaction date - Use authoritative if provided, else fallback to list
  let firstTxDate = authoritativeFirstTxDate || null;
  if (!firstTxDate) {
    const allTxs = [...transactions, ...tokenTransfers].sort(
      (a, b) => Number(a.timeStamp) - Number(b.timeStamp)
    );
    firstTxDate = allTxs.length > 0
      ? new Date(Number(allTxs[0].timeStamp) * 1000)
      : null; // Don't default to "now", allow null
  }

  // Transaction Count - Use authoritative if provided
  const totalTransactions = authoritativeTxCount !== undefined
    ? authoritativeTxCount
    : transactions.length + tokenTransfers.length;

  // Unique days active
  const uniqueDays = new Set([
    ...transactions.map(tx => new Date(Number(tx.timeStamp) * 1000).toISOString().split('T')[0]),
    ...tokenTransfers.map(tx => new Date(Number(tx.timeStamp) * 1000).toISOString().split('T')[0])
  ]);

  // Bridge transactions
  const bridgeContracts = TRACKED_PROTOCOLS
    .filter((p) => p.category === 'bridge')
    .flatMap((p) => p.contracts.map((c) => c.toLowerCase()));

  const bridgeTransactions = transactions.filter((tx) =>
    bridgeContracts.includes(tx.to?.toLowerCase() || '')
  ).length;

  // DEX Activity Check
  const dexContracts = TRACKED_PROTOCOLS
    .filter(p => p.category === 'dex')
    .flatMap(p => p.contracts.map(c => c.toLowerCase()));

  const hasDexActivity = transactions.some(tx =>
    dexContracts.includes(tx.to?.toLowerCase() || '')
  );

  // NEW: Lending Activity Check (for Level 4)
  const lendingContracts = TRACKED_PROTOCOLS
    .filter(p => p.category === 'lending')
    .flatMap(p => p.contracts.map(c => c.toLowerCase()));

  const hasLendingActivity = transactions.some(tx =>
    lendingContracts.includes(tx.to?.toLowerCase() || '')
  );

  // NEW: NFT Activity Check (for Level 3)
  const nftContracts = TRACKED_PROTOCOLS
    .filter(p => p.category === 'nft')
    .flatMap(p => p.contracts.map(c => c.toLowerCase()));

  const hasNftActivity = nftTransfers.length > 0 || transactions.some(tx =>
    nftContracts.includes(tx.to?.toLowerCase() || '')
  );

  const stats: WalletStats = {
    totalTransactions,
    uniqueProtocols: uniqueContracts.size,
    totalVolume: Math.round(totalVolume * 100) / 100,
    firstTxDate,
    daysActive: uniqueDays.size,
    gasSpent: Math.round(gasSpent * 10000) / 10000,
    nftsMinted: nftTransfers.length,
    bridgeTransactions,
    tokenCount: new Set(tokenTransfers.map(t => t.contractAddress)).size,
    hasDexActivity,
    hasLendingActivity,
    hasNftActivity,
    ethBalance,
  };

  console.log('✅ Stats Calculated:', { totalTransactions, firstTxDate });
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

// NEW: Fast data fetch for progressive loading (Alchemy / Viem)
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`)
});

export async function fetchFastData(address: string) {
  console.log('⚡ Fetching FAST data (Alchemy + FirstTx)...');
  const [balance, transactionCount, basename, firstTxDate] = await Promise.all([
    publicClient.getBalance({ address: address as `0x${string}` }),
    publicClient.getTransactionCount({ address: address as `0x${string}` }),
    getBasename(address),
    fetchFirstTransactionDate(address) // NEW: Get accurate wallet age
  ]);

  return {
    ethBalance: Number(balance) / 1e18,
    txCount: transactionCount,
    basename,
    firstTxDate // NEW: Single source of truth for wallet age
  };
}

export async function fetchHistoryData(address: string) {
  console.log('📜 Fetching HISTORY data (BaseScan)...');
  const [txResult, tokenTransfers, nftTransfers] = await Promise.all([
    getTransactions(address),
    getTokenTransfers(address),
    getNFTTransfers(address),
  ]);

  return {
    transactions: txResult.data,
    tokenTransfers,
    nftTransfers,
    isApproximate: txResult.isApproximate // NEW: Flag for UI
  };
}

// M-3 FIX: Legacy fetchWalletData function removed
// Use fetchFastData + fetchHistoryData + calculateWalletStats directly instead
// See useWalletData.ts for the recommended pattern