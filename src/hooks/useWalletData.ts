import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import {
  fetchFastData,
  fetchHistoryData,
  calculateWalletStats,
} from '@/lib/basescan';
import { getCdpWalletData } from '@/app/actions/cdp';
import { getFarcasterData } from '@/app/actions/farcaster';
import { mapCdpHistoryToBasescan, getEthBalanceFromCdp } from '@/lib/cdp-mapping';
import { calculateBaseScore } from '@/utils/calculateScore';
import { getPercentileEstimate } from '@/utils/getRankInfo';
import { getTokenPrices } from '@/lib/price';

import type { WalletStats, ChecklistItem, Trade, PnLData } from '@/types';
import { generateChecklist } from '@/lib/basescan';

// CACHING: 5-minute cache to reduce API calls on rapid refreshes
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
interface CacheEntry {
  fastData: any;
  history: any;
  timestamp: number;
}
const walletCache: Map<string, CacheEntry> = new Map();

function getCachedData(address: string): CacheEntry | null {
  const cached = walletCache.get(address.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log('✅ Using cached data (age:', Math.round((Date.now() - cached.timestamp) / 1000), 'seconds)');
    return cached;
  }
  return null;
}

function setCachedData(address: string, fastData: any, history: any) {
  walletCache.set(address.toLowerCase(), {
    fastData,
    history,
    timestamp: Date.now()
  });
  console.log('💾 Cached wallet data for 5 minutes');
}

interface UseWalletDataResult {
  isLoading: boolean;
  error: string | null;
  stats: WalletStats | null;
  checklist: ChecklistItem[];
  baseScore: number;
  percentile: number;
  recentTrades: Trade[];
  pnl: PnLData | null;
  refetch: () => void;
  lastFetched: Date | null;
  transactions: any[]; // NEW: Raw transaction list for details
}

const INITIAL_STATS: WalletStats = {
  totalTransactions: 0,
  uniqueProtocols: 0,
  totalVolume: 0,
  firstTxDate: null,
  daysActive: 0,
  gasSpent: 0,
  nftsMinted: 0,
  bridgeTransactions: 0,
  basename: null,
  tokenCount: 0,
  hasDexActivity: false,
  hasLendingActivity: false,
  hasNftActivity: false,
  ethBalance: 0,
  farcaster: null,
};

export function useWalletData(): UseWalletDataResult {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<WalletStats | null>(null);
  const [ethBalance, setEthBalance] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [baseScore, setBaseScore] = useState(0);
  const [percentile, setPercentile] = useState(0);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  // FIX C-1: Track current fetch to prevent race conditions
  const currentFetchRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    // FIX C-1: Race condition guard - increment fetch ID
    const fetchId = ++currentFetchRef.current;
    const isCurrent = () => fetchId === currentFetchRef.current;

    console.log('📊 useWalletData.fetchData called:', {
      address: address || 'NO ADDRESS',
      isConnected,
      fetchId
    });

    if (!address || !isConnected) {
      console.log('⚠️ Skipping fetch - no valid address or not connected');
      setStats(null);
      setChecklist([]);
      setBaseScore(0);
      setPercentile(0);
      setRecentTrades([]);
      setEthBalance(0);
      return;
    }

    // FIX H-1: Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      console.error('❌ Invalid address format:', address);
      setError('Invalid wallet address');
      return;
    }

    // FIX H-3: Check cache before fetching
    const cached = getCachedData(address);
    if (cached) {
      console.log('📦 Using cached data');
      const { fastData, history } = cached;
      const realTxCount = history.transactions.length + history.tokenTransfers.length;
      const cachedStats = calculateWalletStats(
        history.transactions,
        history.tokenTransfers,
        history.nftTransfers,
        {},
        realTxCount,
        fastData.firstTxDate,
        fastData.ethBalance
      );
      cachedStats.basename = fastData.basename;
      cachedStats.isApproximate = history.isApproximate;

      setStats(cachedStats);
      setEthBalance(fastData.ethBalance);
      setTransactions(history.transactions);
      setChecklist(generateChecklist(history.transactions, history.tokenTransfers, history.nftTransfers));
      const score = calculateBaseScore(cachedStats, fastData.ethBalance);
      setBaseScore(score.total);
      setPercentile(getPercentileEstimate(score.total));
      setLastFetched(new Date(cached.timestamp));
      return;
    }

    console.log('✅ Fetching fresh data for address:', address);
    setIsLoading(true);
    setError(null);

    try {
      let fastData: any = null;
      let history: any = null;
      let usedCdp = false;

      // STEP 0.5: Try CDP Data Integration (Option B)
      try {
        console.time('CDP Fetch');
        const cdpResult = await getCdpWalletData(address);
        console.timeEnd('CDP Fetch');

        if (cdpResult.success && cdpResult.data) {
          console.log('✅ CDP Data received successfully');

          // Parse Balances - handle nested data structure
          const cdpBalancesRaw = cdpResult.data.balances;
          const cdpBalancesData = Array.isArray(cdpBalancesRaw)
            ? cdpBalancesRaw
            : (cdpBalancesRaw?.data || cdpBalancesRaw?.balances || []);
          const cdpEthBalance = getEthBalanceFromCdp(cdpBalancesData);

          // Parse History - handle nested data structure
          const cdpHistoryRaw = cdpResult.data.history;
          const rawHistoryList = Array.isArray(cdpHistoryRaw)
            ? cdpHistoryRaw
            : (cdpHistoryRaw?.data || cdpHistoryRaw?.transactions || []);
          const mappedTransactions = mapCdpHistoryToBasescan(rawHistoryList);

          // VALIDATION: Only use CDP if we got meaningful data
          // If CDP returns empty history, fall back to BaseScan which might have more data
          if (mappedTransactions.length === 0 && cdpEthBalance === 0) {
            console.warn('⚠️ CDP returned empty data, falling back to BaseScan');
          } else {
            // Sort for firstTxDate
            const sortedTxs = [...mappedTransactions].sort((a, b) => Number(a.timeStamp) - Number(b.timeStamp));
            const estimatedFirstTxDate = sortedTxs.length > 0 ? new Date(Number(sortedTxs[0].timeStamp) * 1000) : null;

            // Fetch basename separately since CDP doesn't provide it
            let basename: string | null = null;
            try {
              const { getBasename } = await import('@/lib/basename');
              basename = await getBasename(address);
              console.log('📛 Basename resolved:', basename || 'none');
            } catch (basenameErr) {
              console.warn('⚠️ Basename fetch failed:', basenameErr);
            }

            // Construct standardized objects
            fastData = {
              ethBalance: cdpEthBalance,
              firstTxDate: estimatedFirstTxDate,
              basename: basename // Now properly fetched
            };

            // CDP-BUG-2 FIX: CDP unified history doesn't properly split token/NFT transfers
            // Always fetch these from Basescan to ensure complete DeFi metrics
            let tokenTransfers: any[] = [];
            let nftTransfers: any[] = [];
            try {
              console.log('📥 Fetching token/NFT transfers from Basescan (CDP supplement)...');
              const { getTokenTransfers, getNFTTransfers } = await import('@/lib/basescan');
              [tokenTransfers, nftTransfers] = await Promise.all([
                getTokenTransfers(address),
                getNFTTransfers(address),
              ]);
              console.log(`✅ Basescan supplement: ${tokenTransfers.length} token transfers, ${nftTransfers.length} NFT transfers`);
            } catch (supplementErr) {
              console.warn('⚠️ Basescan supplement fetch failed:', supplementErr);
            }

            history = {
              transactions: mappedTransactions,
              tokenTransfers: tokenTransfers,  // CDP-BUG-2 FIX: Now from Basescan
              nftTransfers: nftTransfers,      // CDP-BUG-2 FIX: Now from Basescan
              isApproximate: false
            };

            usedCdp = true;
            console.log(`📊 CDP: ${mappedTransactions.length} txs, ${cdpEthBalance.toFixed(4)} ETH, basename: ${basename || 'none'}`);
          }
        }
      } catch (cdpErr) {
        console.warn('⚠️ CDP Fetch failed, falling back to BaseScan:', cdpErr);
        usedCdp = false;
      }

      // Fallback Strategy: If CDP failed or returned no data, use original Alchemy/BaseScan
      if (!usedCdp) {
        // STEP 1: FAST (Alchemy)
        console.time('FastFetch');
        fastData = await fetchFastData(address);
        console.timeEnd('FastFetch');

        // FIX C-1: Check if this fetch is still current
        if (!isCurrent()) return;

        console.time('HistoryFetch');
        history = await fetchHistoryData(address);
        console.timeEnd('HistoryFetch');
      }

      // Shared Logic for Step 2 (Stats calculation)


      setEthBalance(fastData.ethBalance);

      // FIX C-1: Check if this fetch is still current
      if (!isCurrent()) {
        console.log('⚠️ Fetch aborted - wallet changed');
        return;
      }

      const authoritativeFirstTxDate = fastData.firstTxDate;
      const realTxCount = history.transactions.length + history.tokenTransfers.length;

      const calculatedStats = calculateWalletStats(
        history.transactions,
        history.tokenTransfers,
        history.nftTransfers,
        {},
        realTxCount,
        authoritativeFirstTxDate,
        fastData.ethBalance
      );

      const step2Stats: WalletStats = {
        ...calculatedStats,
        totalTransactions: realTxCount,
        firstTxDate: authoritativeFirstTxDate,
        basename: fastData.basename,
        isApproximate: history.isApproximate
      };

      setStats(step2Stats);
      const step2Score = calculateBaseScore(step2Stats, fastData.ethBalance);
      setBaseScore(step2Score.total);
      setPercentile(getPercentileEstimate(step2Score.total)); // FIX H-2: Removed duplicate
      setChecklist(generateChecklist(history.transactions, history.tokenTransfers, history.nftTransfers));
      setTransactions(history.transactions);

      // STEP 3: SLOW (Prices / Gecko)
      // Volume & PnL
      console.time('PriceFetch');

      // Collect unique tokens from history
      const uniqueTokenAddresses = Array.from(new Set(
        history.tokenTransfers
          .map((t: any) => t.contractAddress?.toLowerCase())
          .filter((addr: string | undefined) => addr && addr.startsWith('0x'))
      )).slice(0, 30);

      // Ensure WETH
      if (!uniqueTokenAddresses.includes('0x4200000000000000000000000000000000000006')) {
        uniqueTokenAddresses.push('0x4200000000000000000000000000000000000006');
      }

      const prices = await getTokenPrices(uniqueTokenAddresses as string[]);
      console.timeEnd('PriceFetch');

      // FIX C-1: Check if this fetch is still current before final update
      if (!isCurrent()) {
        console.log('⚠️ Fetch aborted - wallet changed');
        return;
      }

      // Calculate Final Stats with prices
      const pricedStats = calculateWalletStats(
        history.transactions,
        history.tokenTransfers,
        history.nftTransfers,
        prices,
        realTxCount,           // AUTHORITATIVE: From BaseScan history
        authoritativeFirstTxDate, // AUTHORITATIVE: From Dedicated Age
        fastData.ethBalance    // NEW: For Level checks
      );

      // Fetch Farcaster data (parallel with price fetch)
      console.time('FarcasterFetch');
      const farcasterData = await getFarcasterData(address);
      console.timeEnd('FarcasterFetch');

      // SINGLE SOURCE OF TRUTH: Override with authoritative values
      const finalStats: WalletStats = {
        ...pricedStats,
        totalTransactions: realTxCount,       // FIXED: From BaseScan (all txs)
        firstTxDate: authoritativeFirstTxDate,    // FIXED: From dedicated API
        basename: fastData.basename,
        isApproximate: history.isApproximate,      // Flag if >5000 txs
        farcaster: farcasterData,                   // NEW: Farcaster profile data
      };

      // Final Update
      setStats(finalStats);
      const finalScore = calculateBaseScore(finalStats, fastData.ethBalance);
      setBaseScore(finalScore.total);
      setPercentile(getPercentileEstimate(finalScore.total));

      // CACHING: Store data and update freshness timestamp
      setCachedData(address, fastData, history);
      setLastFetched(new Date());

      // TODO: Parse recent trades implementation needs extract
      // setRecentTrades(parseRecentTrades(...)) - Assuming it's not exported or needs refactor

    } catch (err) {
      console.error('Error progressive fetching:', err);
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generators for PnL... (Mock for now or integrate real)
  const pnl: PnLData | null = (stats && stats.totalTransactions > 0)
    ? {
      totalPnL: 0, // Placeholder
      totalPnLPercent: 0,
      winRate: 0,
      totalTrades: 0,
      bestTrade: { token: 'ETH', profit: 0, percent: 0 },
      worstTrade: { token: 'ETH', loss: 0, percent: 0 },
      last7Days: 0,
      last30Days: 0,
    }
    : null;

  return {
    isLoading: isLoading && !stats, // Only show full loader if NO stats yet (Step 0)
    error,
    stats,
    checklist,
    baseScore,
    percentile,
    recentTrades,
    pnl,
    refetch: fetchData,
    lastFetched,
    transactions, // NEW
  };
}

// Hook to detect if we're in a mini app context
export function useMiniAppContext() {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    // Check if we're in a Farcaster mini app context
    const checkContext = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { sdk } = await import('@farcaster/frame-sdk');
        const ctx = await sdk.context;
        if (ctx) {
          setIsMiniApp(true);
          setContext(ctx);
          // Tell the host app we're ready
          sdk.actions.ready();
        }
      } catch (err) {
        // Not in a mini app context
        setIsMiniApp(false);
      }
    };

    checkContext();
  }, []);

  return { isMiniApp, context };
}
