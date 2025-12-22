import { useState, useCallback } from 'react';
import { fetchFastData, fetchHistoryData, calculateWalletStats } from '@/lib/basescan';
import { calculateBaseScore } from '@/utils/calculateScore';
import { getPercentileEstimate } from '@/utils/getRankInfo';
import { getTokenPrices } from '@/lib/price';
import type { WalletStats } from '@/types';

interface CompareWalletResult {
    isLoading: boolean;
    error: string | null;
    stats: WalletStats | null;
    score: number;
    percentile: number;
    ethBalance: number;
    fetch: (address: string) => Promise<void>;
    clear: () => void;
}

export function useCompareWallet(): CompareWalletResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [score, setScore] = useState(0);
    const [percentile, setPercentile] = useState(0);
    const [ethBalance, setEthBalance] = useState(0);

    const fetchCompareData = useCallback(async (address: string) => {
        // Validate address
        if (!address || !address.startsWith('0x') || address.length !== 42) {
            setError('Invalid address format');
            return;
        }

        setIsLoading(true);
        setError(null);
        setStats(null);

        try {
            console.log('🔍 Fetching comparison data for:', address);

            // Step 1: Fast data (Alchemy)
            const fastData = await fetchFastData(address);
            setEthBalance(fastData.ethBalance);

            // Step 2: History data (BaseScan)
            const history = await fetchHistoryData(address);

            // Step 3: Get prices for volume calculation
            const uniqueTokenAddresses = Array.from(new Set(
                history.tokenTransfers
                    .map(t => t.contractAddress?.toLowerCase())
                    .filter(addr => addr && addr.startsWith('0x'))
            )).slice(0, 30);

            if (!uniqueTokenAddresses.includes('0x4200000000000000000000000000000000000006')) {
                uniqueTokenAddresses.push('0x4200000000000000000000000000000000000006');
            }

            const prices = await getTokenPrices(uniqueTokenAddresses as string[]);

            // Calculate stats
            const calculatedStats = calculateWalletStats(
                history.transactions,
                history.tokenTransfers,
                history.nftTransfers,
                prices
            );

            // REAL TRANSACTION COUNT: Use BaseScan history length (includes both sent AND received)
            // Alchemy's txCount is the NONCE (outgoing only) - NOT what the user expects
            const realTxCount = history.transactions.length + history.tokenTransfers.length;

            // Apply single source of truth values
            const finalStats: WalletStats = {
                ...calculatedStats,
                totalTransactions: realTxCount, // FIXED: From BaseScan (all txs)
                firstTxDate: fastData.firstTxDate,
                basename: fastData.basename,
                isApproximate: history.isApproximate
            };

            setStats(finalStats);

            // Calculate score
            const scoreBreakdown = calculateBaseScore(finalStats, fastData.ethBalance);
            setScore(scoreBreakdown.total);
            setPercentile(getPercentileEstimate(scoreBreakdown.total));

            console.log('✅ Comparison data loaded:', { score: scoreBreakdown.total, txCount: realTxCount });

        } catch (err) {
            console.error('❌ Error fetching comparison data:', err);
            setError('Failed to fetch wallet data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setStats(null);
        setScore(0);
        setPercentile(0);
        setEthBalance(0);
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        stats,
        score,
        percentile,
        ethBalance,
        fetch: fetchCompareData,
        clear
    };
}
