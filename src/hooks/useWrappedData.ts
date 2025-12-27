// Only log in development (FIX M-5)
const isDev = process.env.NODE_ENV === 'development';
const log = (...args: unknown[]) => isDev && console.log('[Wrapped]', ...args);
const logWarn = (...args: unknown[]) => isDev && console.warn('[Wrapped]', ...args);

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { WrappedData } from '@/types/wrapped';
import { calculateWrappedMetrics } from '@/lib/wrapped/calculateMetrics';
import { getCdpWalletData } from '@/app/actions/cdp';
import { mapCdpHistoryToBasescan } from '@/lib/cdp-mapping';
import {
    getTransactions,
    getTokenTransfers,
    getNFTTransfers,
    fetchFirstTransactionDate
} from '@/lib/basescan';
import { getBasename } from '@/lib/basename';
import { estimatePercentile, getUserPercentile } from '@/lib/dune';
import { getCachedWrappedData, setCachedWrappedData } from '@/lib/wrapped/cache';

interface UseWrappedDataResult {
    isLoading: boolean;
    error: string | null;
    data: WrappedData | null;
    refetch: () => void;
    setTargetAddress: (address: string) => void;
    targetAddress: string;
    isUsingConnectedWallet: boolean;
}

export function useWrappedData(): UseWrappedDataResult {
    const { address: connectedAddress, isConnected } = useAccount();
    const [targetAddress, setTargetAddressState] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<WrappedData | null>(null);

    // BUG-4 FIX: Track current fetch to prevent race conditions
    const currentFetchRef = useRef<number>(0);

    // Determine which address to use
    const effectiveAddress = targetAddress || (isConnected ? connectedAddress : null);
    const isUsingConnectedWallet = !targetAddress && !!connectedAddress;

    const setTargetAddress = useCallback((address: string) => {
        // Validate address format
        if (address && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            setError('Invalid wallet address format');
            return;
        }
        setError(null);
        setTargetAddressState(address);
    }, []);

    const fetchWrappedData = useCallback(async () => {
        // BUG-4 FIX: Race condition guard - increment fetch ID
        const fetchId = ++currentFetchRef.current;
        const isCurrent = () => fetchId === currentFetchRef.current;

        if (!effectiveAddress) {
            setData(null);
            return;
        }

        const addressLower = effectiveAddress.toLowerCase();

        // Check persistent cache first (Vercel KV or memory)
        // FIX H-2: Check isCurrent() before using cached data
        try {
            const cached = await getCachedWrappedData(addressLower);
            if (cached && isCurrent()) {
                log('Using cached wrapped data');
                setData(cached);
                return;
            }
        } catch (cacheError) {
            logWarn('Cache check failed:', cacheError);
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🎁 Fetching wrapped data for:', effectiveAddress);

            let transactions: any[] = [];
            let tokenTransfers: any[] = [];
            let nftTransfers: any[] = [];
            let usedCdp = false;

            // Try CDP first (primary)
            try {
                log('Trying CDP as primary data source...');
                const cdpResult = await getCdpWalletData(effectiveAddress);

                // FIX H-3: Add null safety for CDP data and history
                if (cdpResult.success && cdpResult.data?.history) {
                    // Parse history from CDP
                    const cdpHistoryRaw = cdpResult.data.history;
                    const rawHistoryList = Array.isArray(cdpHistoryRaw)
                        ? cdpHistoryRaw
                        : (cdpHistoryRaw?.data || cdpHistoryRaw?.transactions || []);

                    transactions = mapCdpHistoryToBasescan(rawHistoryList);

                    if (transactions.length > 0) {
                        usedCdp = true;
                        log('CDP data loaded:', transactions.length, 'transactions');

                        // CDP-BUG-2 FIX: CDP doesn't properly split token/NFT transfers
                        // Always fetch these from Basescan for complete DeFi metrics
                        try {
                            log('Supplementing CDP with token/NFT data from Basescan...');
                            const [tokenTx, nftTx] = await Promise.all([
                                getTokenTransfers(effectiveAddress),
                                getNFTTransfers(effectiveAddress),
                            ]);
                            tokenTransfers = tokenTx.map(t => ({
                                hash: t.hash,
                                timeStamp: t.timeStamp,
                                from: t.from,
                                to: t.to,
                                contractAddress: t.contractAddress,
                                tokenName: t.tokenName,
                                tokenSymbol: t.tokenSymbol,
                                value: t.value,
                            }));
                            nftTransfers = nftTx.map(t => ({
                                hash: t.hash,
                                timeStamp: t.timeStamp,
                                from: t.from,
                                to: t.to,
                                contractAddress: t.contractAddress,
                                tokenName: t.tokenName,
                            }));
                            log('Basescan supplement:', tokenTransfers.length, 'token transfers,', nftTransfers.length, 'NFT transfers');
                        } catch (supplementErr) {
                            logWarn('Basescan supplement failed:', supplementErr);
                        }
                    } else {
                        log('CDP returned empty data, will try Basescan');
                    }
                } else {
                    log('CDP failed:', cdpResult.error || 'No history data');
                }
            } catch (cdpErr) {
                logWarn('CDP fetch error, falling back to Basescan:', cdpErr);
            }

            // Fallback to Basescan if CDP failed or returned empty
            let basescanFailed = false;
            if (!usedCdp) {
                log('Using Basescan as fallback...');
                try {
                    const [txResult, tokenTx, nftTx] = await Promise.all([
                        getTransactions(effectiveAddress),
                        getTokenTransfers(effectiveAddress),
                        getNFTTransfers(effectiveAddress),
                    ]);

                    transactions = txResult.data.map(tx => ({
                        hash: tx.hash,
                        timeStamp: tx.timeStamp,
                        from: tx.from,
                        to: tx.to,
                        value: tx.value,
                        gasUsed: tx.gasUsed,
                        gasPrice: tx.gasPrice,
                        functionName: tx.functionName,
                        isError: tx.isError,
                    }));

                    tokenTransfers = tokenTx.map(t => ({
                        hash: t.hash,
                        timeStamp: t.timeStamp,
                        from: t.from,
                        to: t.to,
                        contractAddress: t.contractAddress,
                        tokenName: t.tokenName,
                        tokenSymbol: t.tokenSymbol,
                        value: t.value,
                    }));

                    nftTransfers = nftTx.map(t => ({
                        hash: t.hash,
                        timeStamp: t.timeStamp,
                        from: t.from,
                        to: t.to,
                        contractAddress: t.contractAddress,
                        tokenName: t.tokenName,
                    }));

                    log('Basescan data loaded:', transactions.length, 'transactions');
                } catch (basescanErr) {
                    logWarn('Basescan fetch error:', basescanErr);
                    basescanFailed = true;
                }
            }

            // If both sources failed, show a helpful error
            if (!usedCdp && basescanFailed) {
                throw new Error('Unable to fetch wallet data. The server is busy - please try again in a few seconds.');
            }

            // Get basename (always fetch separately)
            const basename = await getBasename(effectiveAddress).catch(() => null);

            log('Data fetched:', {
                transactions: transactions.length,
                tokenTransfers: tokenTransfers.length,
                nftTransfers: nftTransfers.length,
                basename,
                source: usedCdp ? 'CDP' : 'Basescan',
            });

            // Get real ETH price from CoinGecko
            const { getEthPrice } = await import('@/lib/prices');
            const ethPrice = await getEthPrice();
            log('Using ETH price:', ethPrice);

            // Detect smart wallet usage
            const { countGaslessTransactions } = await import('@/lib/smartWallet');
            const gaslessCount = countGaslessTransactions(transactions);
            log('Gasless transactions:', gaslessCount);

            // Calculate metrics
            let wrappedData = calculateWrappedMetrics(
                effectiveAddress,
                transactions,
                tokenTransfers,
                nftTransfers,
                basename,
                ethPrice
            );

            // Add smart wallet data
            wrappedData.gaslessTransactions = gaslessCount;
            wrappedData.hasSmartWallet = gaslessCount > 0;

            // Calculate percentile from transaction count (optionally fetch from Dune)
            wrappedData.percentileRank = estimatePercentile(wrappedData.totalTransactions);

            // Cache the result to persistent storage
            try {
                await setCachedWrappedData(addressLower, wrappedData);
            } catch (cacheError) {
                logWarn('Failed to cache wrapped data:', cacheError);
            }

            // BUG-4 FIX: Only set data if this is still the current fetch
            if (!isCurrent()) {
                log('Fetch cancelled - address changed');
                return;
            }

            setData(wrappedData);
            log('Wrapped data calculated successfully');

        } catch (err) {
            logWarn('Error fetching wrapped data:', err);
            if (isCurrent()) {
                setError(err instanceof Error ? err.message : 'Failed to fetch wrapped data');
                setData(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [effectiveAddress]);

    // Fetch data when address changes
    useEffect(() => {
        fetchWrappedData();
    }, [fetchWrappedData]);

    return {
        isLoading,
        error,
        data,
        refetch: fetchWrappedData,
        setTargetAddress,
        targetAddress,
        isUsingConnectedWallet,
    };
}
