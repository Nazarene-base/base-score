import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import {
  fetchFastData,
  fetchHistoryData,
  calculateWalletStats, // Need this exported
  fetchWalletData // Legacy fallback
} from '@/lib/basescan';
import { calculateBaseScore } from '@/utils/calculateScore';
import { getPercentileEstimate } from '@/utils/getRankInfo';
import { getTokenPrices } from '@/lib/price'; // Import direct if needed

import type { WalletStats, ChecklistItem, Trade, PnLData } from '@/types';
import { generateChecklist } from '@/lib/basescan';

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
};

export function useWalletData(): UseWalletDataResult {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<WalletStats | null>(null);
  const [ethBalance, setEthBalance] = useState(0); // Store separately for progressive updates
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [baseScore, setBaseScore] = useState(0);
  const [percentile, setPercentile] = useState(0);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  const fetchData = useCallback(async () => {
    if (!address || !isConnected) {
      setStats(null);
      setChecklist([]);
      setBaseScore(0);
      setPercentile(0);
      setRecentTrades([]);
      setEthBalance(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    // setStats(INITIAL_STATS); // Don't reset to empty, keep null to show skeletons until Step 1


    try {
      // STEP 1: FAST (Alchemy)
      // Immediate "Alive" check - Balances & Tx Count
      console.time('FastFetch');
      const fastData = await fetchFastData(address);
      console.timeEnd('FastFetch');

      setEthBalance(fastData.ethBalance);

      const step1Stats: WalletStats = {
        ...INITIAL_STATS,
        totalTransactions: fastData.txCount, // SINGLE SOURCE OF TRUTH: Alchemy Nonce
        firstTxDate: fastData.firstTxDate,   // SINGLE SOURCE OF TRUTH: Dedicated API call
        basename: fastData.basename
      };

      // Store authoritative values - NEVER OVERWRITE
      const alchemyTxCount = fastData.txCount;
      const authoritativeFirstTxDate = fastData.firstTxDate;

      // Update UI immediately
      setStats(step1Stats);
      const step1Score = calculateBaseScore(step1Stats, fastData.ethBalance);
      setBaseScore(step1Score.total);
      setPercentile(getPercentileEstimate(step1Score.total));

      // STEP 2: HISTORY (BaseScan)
      // For Days Active, Protocols - NOT for Tx Count or First Date
      console.time('HistoryFetch');
      const history = await fetchHistoryData(address);
      console.timeEnd('HistoryFetch');

      // Calculate Step 2 Stats (No prices yet)
      const calculatedStats = calculateWalletStats(
        history.transactions,
        history.tokenTransfers,
        history.nftTransfers,
        {} // No prices yet
      );

      // SINGLE SOURCE OF TRUTH: Override with authoritative values
      const step2Stats: WalletStats = {
        ...calculatedStats,
        totalTransactions: alchemyTxCount,        // FIXED: From Alchemy
        firstTxDate: authoritativeFirstTxDate,    // FIXED: From dedicated API
        basename: fastData.basename
      };

      // Update UI
      setStats(step2Stats);
      const step2Score = calculateBaseScore(step2Stats, fastData.ethBalance);
      setBaseScore(step2Score.total);
      setPercentile(getPercentileEstimate(step2Score.total));
      setChecklist(generateChecklist(history.transactions, history.tokenTransfers, history.nftTransfers));

      // STEP 3: SLOW (Prices / Gecko)
      // Volume & PnL
      console.time('PriceFetch');

      // Collect unique tokens from history
      const uniqueTokenAddresses = Array.from(new Set(
        history.tokenTransfers
          .map(t => t.contractAddress?.toLowerCase())
          .filter(addr => addr && addr.startsWith('0x'))
      )).slice(0, 30);

      // Ensure WETH
      if (!uniqueTokenAddresses.includes('0x4200000000000000000000000000000000000006')) {
        uniqueTokenAddresses.push('0x4200000000000000000000000000000000000006');
      }

      const prices = await getTokenPrices(uniqueTokenAddresses as string[]);
      console.timeEnd('PriceFetch');

      // Calculate Final Stats with prices
      const pricedStats = calculateWalletStats(
        history.transactions,
        history.tokenTransfers,
        history.nftTransfers,
        prices
      );

      // SINGLE SOURCE OF TRUTH: Override with authoritative values
      const finalStats: WalletStats = {
        ...pricedStats,
        totalTransactions: alchemyTxCount,        // FIXED: From Alchemy
        firstTxDate: authoritativeFirstTxDate,    // FIXED: From dedicated API
        basename: fastData.basename
      };

      // Final Update
      setStats(finalStats);
      const finalScore = calculateBaseScore(finalStats, fastData.ethBalance);
      setBaseScore(finalScore.total);
      setPercentile(getPercentileEstimate(finalScore.total));

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
