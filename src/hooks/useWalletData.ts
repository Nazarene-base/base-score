// Custom hooks for Base Score app
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { fetchWalletData } from '@/lib/basescan';
import type { WalletStats, ChecklistItem, Trade, PnLData } from '@/types';

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

export function useWalletData(): UseWalletDataResult {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
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
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWalletData(address);
      setStats(data.stats);
      setChecklist(data.checklist);
      setBaseScore(data.baseScore);
      setPercentile(data.percentile);
      setRecentTrades(data.recentTrades);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to fetch wallet data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debug logging as requested
  useEffect(() => {
    if (address && stats) {
      console.log('--------------------------------------------------');
      console.log('👛 Wallet Address:', address);
      console.log('📊 Fetched Transactions:', stats.totalTransactions);
      console.log('🔢 Calculated Score:', baseScore);
      console.log('🌐 Protocol Interactions:', stats.uniqueProtocols);
      console.log('--------------------------------------------------');
    }
  }, [address, stats, baseScore]);

  // Generate mock P&L data ONLY if we have actual trades
  // In a real app, this would be calculated from historical price data
  const pnl: PnLData | null = (stats && recentTrades.length > 0)
    ? {
      totalPnL: Math.random() * 5000 - 1000, // Mock based on activity
      totalPnLPercent: Math.random() * 100 - 20,
      winRate: 50 + Math.random() * 30,
      totalTrades: recentTrades.length,
      bestTrade: {
        token: recentTrades[0]?.token || 'ETH',
        profit: Math.random() * 1000,
        percent: Math.random() * 200,
      },
      worstTrade: {
        token: recentTrades[1]?.token || 'USDC',
        loss: -(Math.random() * 500),
        percent: -(Math.random() * 50),
      },
      last7Days: Math.random() * 1000 - 200,
      last30Days: Math.random() * 3000 - 500,
    }
    : null;

  return {
    isLoading,
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
