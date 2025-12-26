import { useState, useCallback } from 'react';
import { fetchFastData, fetchHistoryData, calculateWalletStats } from '@/lib/basescan';
import { calculateBaseScore } from '@/utils/calculateScore';
import { getPercentileEstimate } from '@/utils/getRankInfo';
import { getTokenPrices } from '@/lib/price';
import { resolveAddressOrName, isEnsName } from '@/lib/ens';
import type { WalletStats } from '@/types';

interface CompareWalletResult {
    isLoading: boolean;
    error: string | null;
    stats: WalletStats | null;
    score: number;
    percentile: number;
    ethBalance: number;
    resolvedAddress: string | null;
    resolvedName: string | null;
    fetch: (input: string) => Promise<void>;
    clear: () => void;
}

export function useCompareWallet(): CompareWalletResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [score, setScore] = useState(0);
    const [percentile, setPercentile] = useState(0);
    const [ethBalance, setEthBalance] = useState(0);
    const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
    const [resolvedName, setResolvedName] = useState<string | null>(null);

    const fetchCompareData = useCallback(async (input: string) => {
        setIsLoading(true);
        setError(null);
        setStats(null);
        setResolvedAddress(null);
        setResolvedName(null);

        try {
            // Step 0: Resolve ENS/basename to address if needed
            let address = input.trim();
            let displayName: string | null = null;

            if (isEnsName(input)) {
                console.log('🔍 Resolving ENS name:', input);
                const resolution = await resolveAddressOrName(input);

                if (resolution.error || !resolution.address) {
                    setError(resolution.error || 'Could not resolve name');
                    setIsLoading(false);
                    return;
                }

                address = resolution.address;
                displayName = resolution.resolvedName;
                setResolvedAddress(address);
                setResolvedName(displayName);
                console.log('✅ Resolved to:', address);
            } else {
                // Validate direct address
                if (!address.startsWith('0x') || address.length !== 42) {
                    setError('Please enter a valid address (0x...) or ENS name (.eth or .base.eth)');
                    setIsLoading(false);
                    return;
                }
                setResolvedAddress(address);
            }

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

            // REAL TRANSACTION COUNT: Use BaseScan history length (includes both sent AND received)
            const realTxCount = history.transactions.length + history.tokenTransfers.length;

            // Calculate stats with all authoritative values
            const calculatedStats = calculateWalletStats(
                history.transactions,
                history.tokenTransfers,
                history.nftTransfers,
                prices,
                realTxCount,           // AUTHORITATIVE: From BaseScan
                fastData.firstTxDate,  // AUTHORITATIVE: From dedicated API
                fastData.ethBalance    // NEW: For Level checks
            );

            // Apply single source of truth values
            const finalStats: WalletStats = {
                ...calculatedStats,
                totalTransactions: realTxCount,
                firstTxDate: fastData.firstTxDate,
                basename: displayName || fastData.basename,
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
            setError('Failed to fetch wallet data. Please try again.');
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
        setResolvedAddress(null);
        setResolvedName(null);
    }, []);

    return {
        isLoading,
        error,
        stats,
        score,
        percentile,
        ethBalance,
        resolvedAddress,
        resolvedName,
        fetch: fetchCompareData,
        clear
    };
}
