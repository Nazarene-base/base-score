// Metric calculation functions for Base Year Wrapped - Full 18-Card Experience
// With NFT filtering, first-ever TX tracking, and storytelling data

import {
    WrappedData,
    WRAPPED_PROTOCOL_NAMES,
    KNOWN_NFT_MARKETPLACES,
    BADGE_DEFINITIONS
} from '@/types/wrapped';
import {
    determineTribe,
    getGasSavedEquivalent,
    getMostActiveMonth,
    getPreferredTimeOfDay,
    getLongestStreak,
    getCurrentStreak,
    getMostActiveDay,
} from './determineTribe';

// 2025 date range constants
const YEAR_START = new Date('2025-01-01T00:00:00Z');
const YEAR_END = new Date(); // Current date

// L1 gas cost estimation (per transaction average)
const AVG_L1_GAS_PER_TX_USD = 12; // Ethereum mainnet average

interface Transaction {
    hash: string;
    timeStamp: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
    functionName?: string;
    isError?: string;
}

interface TokenTransfer {
    hash: string;
    timeStamp: string;
    from: string;
    to: string;
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    value: string;
}

interface NFTTransfer {
    hash: string;
    timeStamp: string;
    from: string;
    to: string;
    contractAddress: string;
    tokenName: string;
}

// Filter transactions to 2025
function filterTo2025<T extends { timeStamp: string }>(items: T[]): T[] {
    return items.filter(item => {
        const date = new Date(Number(item.timeStamp) * 1000);
        return date >= YEAR_START && date <= YEAR_END;
    });
}

// Get first transaction (all time)
function getFirstTransaction(transactions: Transaction[]): { date: string; hash: string } | null {
    if (!transactions.length) return null;
    const sorted = [...transactions].sort((a, b) => Number(a.timeStamp) - Number(b.timeStamp));
    const first = sorted[0];
    return {
        date: new Date(Number(first.timeStamp) * 1000).toISOString(),
        hash: first.hash,
    };
}

// Filter NFTs to only count legitimate mints (not scam airdrops)
function filterLegitimateNFTs(
    nftTransfers: NFTTransfer[],
    walletAddress: string,
    allTransactions: Transaction[]
): { minted: number; received: number; collections: string[] } {
    const walletLower = walletAddress.toLowerCase();
    const txHashes = new Set(allTransactions.map(tx => tx.hash.toLowerCase()));

    let minted = 0;
    let received = 0;
    const collections = new Set<string>();

    nftTransfers.forEach(nft => {
        const fromZero = nft.from?.toLowerCase() === '0x0000000000000000000000000000000000000000';
        const toWallet = nft.to?.toLowerCase() === walletLower;
        const contractLower = nft.contractAddress?.toLowerCase();

        // Only count if the user initiated the transaction (hash exists in their tx list)
        // OR if it's from a known marketplace
        const isKnownMarketplace = KNOWN_NFT_MARKETPLACES.some(m => m.toLowerCase() === contractLower);
        const userInitiated = txHashes.has(nft.hash.toLowerCase());

        if (fromZero && toWallet) {
            // This is a mint
            if (userInitiated || isKnownMarketplace) {
                minted++;
                if (nft.tokenName) collections.add(nft.tokenName);
            }
            // Skip scam mints (not user-initiated and not from known marketplace)
        } else if (toWallet && !fromZero) {
            // This is a transfer to wallet
            if (userInitiated) {
                received++;
                if (nft.tokenName) collections.add(nft.tokenName);
            }
            // Skip unsolicited transfers (likely scam airdrops)
        }
    });

    return {
        minted,
        received,
        collections: Array.from(collections).slice(0, 10),
    };
}

// Calculate badges earned
function calculateBadges(data: Partial<WrappedData>): WrappedData['badges'] {
    return BADGE_DEFINITIONS.map(badge => {
        let earned = false;

        switch (badge.id) {
            case 'og':
                earned = data.isOG || false;
                break;
            case 'early2025':
                earned = data.is2025OG || false;
                break;
            case 'streak7':
                earned = (data.longestStreak || 0) >= 7;
                break;
            case 'streak30':
                earned = (data.longestStreak || 0) >= 30;
                break;
            case 'defi':
                earned = (data.uniqueProtocolsUsed || 0) >= 3;
                break;
            case 'nftCreator':
                earned = (data.nftsMinted || 0) >= 5;
                break;
            case 'gasEfficient':
                earned = (data.gasSavedVsL1USD || 0) >= 100;
                break;
            case 'whale':
                earned = (data.totalVolumeUSD || 0) >= 50000;
                break;
            case 'basename':
                earned = data.hasBasename || false;
                break;
            case 'diverse':
                earned = (data.uniqueProtocolsUsed || 0) >= 5;
                break;
        }

        return { ...badge, earned };
    });
}

// Generate gas saved explanation
function getGasSavedExplanation(txCount: number, gasSavedUSD: number): string {
    if (txCount === 0) return "Start transacting on Base to see your savings!";
    if (gasSavedUSD < 10) return `With ${txCount} transactions, you're just getting started. Base's low fees mean more money stays in your wallet.`;
    if (gasSavedUSD < 50) return `Those ${txCount} transactions would have cost you ${(gasSavedUSD / txCount).toFixed(2)} more each on Ethereum L1.`;
    if (gasSavedUSD < 200) return `By choosing Base over Ethereum mainnet, you kept $${gasSavedUSD.toFixed(0)} for yourself across ${txCount} transactions.`;
    return `You're a power user! ${txCount} transactions on Ethereum L1 would have cost you $${gasSavedUSD.toFixed(0)} more. That's real savings.`;
}

export function calculateWrappedMetrics(
    walletAddress: string,
    transactions: Transaction[],
    tokenTransfers: TokenTransfer[],
    nftTransfers: NFTTransfer[],
    basename: string | null,
    ethPrice: number = 3500
): WrappedData {
    // Get first transaction ever
    const firstEver = getFirstTransaction(transactions);

    // Filter to 2025 only for year-specific stats
    const txs2025 = filterTo2025(transactions);
    const first2025 = getFirstTransaction(txs2025);

    // Basic counts
    const totalTransactions = txs2025.length;
    const totalTransactionsAllTime = transactions.length;

    // Gas calculations
    let totalGasWei = BigInt(0);
    txs2025.forEach(tx => {
        const gasUsed = BigInt(tx.gasUsed || '0');
        const gasPrice = BigInt(tx.gasPrice || '0');
        totalGasWei += gasUsed * gasPrice;
    });

    const totalGasSpentETH = Number(totalGasWei) / 1e18;
    const totalGasSpentUSD = totalGasSpentETH * ethPrice;
    const avgGasPerTxUSD = totalTransactions > 0 ? totalGasSpentUSD / totalTransactions : 0;

    // L1 savings calculation
    const estimatedL1Cost = totalTransactions * AVG_L1_GAS_PER_TX_USD;
    const gasSavedVsL1USD = Math.max(0, estimatedL1Cost - totalGasSpentUSD);

    // Unique days active
    const uniqueDays = new Set<string>();
    txs2025.forEach(tx => {
        const date = new Date(Number(tx.timeStamp) * 1000);
        uniqueDays.add(date.toISOString().split('T')[0]);
    });
    const uniqueDaysActive = uniqueDays.size;

    // Streaks
    const longestStreak = getLongestStreak(txs2025);
    const currentStreak = getCurrentStreak(txs2025);

    // Protocol usage
    const protocolCounts: Record<string, number> = {};
    txs2025.forEach(tx => {
        const toAddr = tx.to?.toLowerCase();
        if (toAddr && WRAPPED_PROTOCOL_NAMES[toAddr]) {
            const protocolName = WRAPPED_PROTOCOL_NAMES[toAddr];
            protocolCounts[protocolName] = (protocolCounts[protocolName] || 0) + 1;
        }
    });

    const uniqueProtocolsUsed = Object.keys(protocolCounts).length;
    const sortedProtocols = Object.entries(protocolCounts).sort(([, a], [, b]) => b - a);
    const favoriteProtocol = sortedProtocols[0]?.[0] || 'None';

    const totalProtocolTxs = Object.values(protocolCounts).reduce((a, b) => a + b, 0);
    const protocolBreakdown = sortedProtocols.slice(0, 5).map(([name, count]) => ({
        name,
        count,
        percentage: totalProtocolTxs > 0 ? Math.round((count / totalProtocolTxs) * 100) : 0,
    }));

    // NFT calculations (FILTERED for scams)
    const nfts2025 = filterTo2025(nftTransfers);
    const nftStats = filterLegitimateNFTs(nfts2025, walletAddress, txs2025);

    // Calculate total volume from ETH transactions (value field)
    // This captures all ETH sent in transactions
    let totalEthVolume = 0;
    let biggestTxValue = 0;
    let biggestTxHash = '';
    let biggestTxDate = '';

    txs2025.forEach(tx => {
        const valueWei = BigInt(tx.value || '0');
        const valueEth = Number(valueWei) / 1e18;
        totalEthVolume += valueEth;

        // Track biggest transaction by ETH value
        if (valueEth > biggestTxValue) {
            biggestTxValue = valueEth;
            biggestTxHash = tx.hash;
            biggestTxDate = new Date(Number(tx.timeStamp) * 1000).toISOString();
        }
    });

    // Total volume in USD (all ETH moved)
    const totalVolumeUSD = totalEthVolume * ethPrice;
    const biggestSingleSwapUSD = biggestTxValue * ethPrice;
    const biggestSwapToken = 'ETH';

    // For token transfers, we estimate value (since we don't have real-time prices for all tokens)
    const tokens2025 = filterTo2025(tokenTransfers);
    // Estimate: each token transfer represents some value
    // This is a simplified approach - in production you'd fetch token prices
    const estimatedTokenVolumeUSD = tokens2025.length * 25; // Conservative estimate per transfer

    // Total swap volume = ETH volume + estimated token volume
    const totalSwapVolumeUSD = totalVolumeUSD + estimatedTokenVolumeUSD;

    // Lucky transaction (lowest gas)
    let luckyTransaction: WrappedData['luckyTransaction'] = null;
    if (txs2025.length > 0) {
        const sortedByGas = [...txs2025].sort((a, b) => {
            const gasA = Number(BigInt(a.gasUsed || '0') * BigInt(a.gasPrice || '0'));
            const gasB = Number(BigInt(b.gasUsed || '0') * BigInt(b.gasPrice || '0'));
            return gasA - gasB;
        });
        const lowestGasTx = sortedByGas[0];
        const lowestGasWei = Number(BigInt(lowestGasTx.gasUsed || '0') * BigInt(lowestGasTx.gasPrice || '0'));
        luckyTransaction = {
            hash: lowestGasTx.hash,
            gasUSD: (lowestGasWei / 1e18) * ethPrice,
            date: new Date(Number(lowestGasTx.timeStamp) * 1000).toISOString(),
        };
    }

    // Busiest day
    const dayTxCounts: Record<string, number> = {};
    txs2025.forEach(tx => {
        const date = new Date(Number(tx.timeStamp) * 1000).toISOString().split('T')[0];
        dayTxCounts[date] = (dayTxCounts[date] || 0) + 1;
    });
    const sortedDays = Object.entries(dayTxCounts).sort(([, a], [, b]) => b - a);
    const busiestDay = sortedDays[0] ? { date: sortedDays[0][0], count: sortedDays[0][1] } : null;

    // OG status
    const isOG = firstEver ? new Date(firstEver.date) < new Date('2023-08-01') : false;
    const is2025OG = first2025 ? new Date(first2025.date) < new Date('2025-02-01') : false;

    // Build partial data for tribe determination
    const partialData: Partial<WrappedData> = {
        totalTransactions,
        totalSwapVolumeUSD,
        uniqueProtocolsUsed,
        nftsMinted: nftStats.minted,
        nftsReceived: nftStats.received,
        uniqueDaysActive,
        longestStreak,
        isOG,
        is2025OG,
        hasBasename: !!basename,
        totalVolumeUSD: totalSwapVolumeUSD + nftStats.minted * 20,
        gasSavedVsL1USD,
    };

    const { tribe, tribeInfo } = determineTribe(partialData);
    const badges = calculateBadges(partialData);

    return {
        walletAddress,
        firstEverTransaction: firstEver?.date || null,
        firstEverTxHash: firstEver?.hash || null,
        first2025Transaction: first2025?.date || null,
        first2025TxHash: first2025?.hash || null,
        totalTransactions,
        totalTransactionsAllTime,
        totalGasSpentETH,
        totalGasSpentUSD,
        gasSavedVsL1USD,
        avgGasPerTxUSD,
        uniqueDaysActive,
        longestStreak,
        currentStreak,
        mostActiveMonth: getMostActiveMonth(txs2025),
        mostActiveDay: getMostActiveDay(txs2025),
        preferredTimeOfDay: getPreferredTimeOfDay(txs2025),
        totalSwapVolumeUSD,
        uniqueProtocolsUsed,
        favoriteProtocol,
        favoriteTradingPair: 'ETH/USDC',
        biggestSingleSwapUSD,
        biggestSwapToken,
        biggestSwapHash: biggestTxHash || null,
        protocolBreakdown,
        nftsMinted: nftStats.minted,
        nftsReceived: nftStats.received,
        totalNftActivity: nftStats.minted + nftStats.received,
        favoriteCollection: nftStats.collections[0] || 'None',
        nftCollections: nftStats.collections,
        hasBasename: !!basename,
        basenameName: basename,
        isOG,
        is2025OG,
        hasSmartWallet: false, // TODO: detect smart wallet usage
        gaslessTransactions: 0, // TODO: detect sponsored transactions
        totalVolumeUSD: totalVolumeUSD,
        percentileRank: 50,
        tribe,
        tribeInfo,
        badges,
        luckyTransaction,
        busiestDay,
        mostExperimentalDay: getMostExperimentalDay(txs2025),
        gasSavedEquivalent: getGasSavedEquivalent(gasSavedVsL1USD),
        gasSavedExplanation: getGasSavedExplanation(totalTransactions, gasSavedVsL1USD),
        // Commerce & Payments
        usdcSentTotal: calculateUsdcSent(tokens2025, walletAddress),
        usdcReceivedTotal: calculateUsdcReceived(tokens2025, walletAddress),
        uniquePaymentRecipients: getUniquePaymentRecipients(tokens2025, walletAddress),
        largestPaymentUSD: getLargestPayment(tokens2025, walletAddress),
        // Farcaster (would need Farcaster API integration)
        farcasterTipsSent: 0,
        farcasterTipsReceived: 0,
        // Protocol Diversity Index
        protocolDiversityIndex: totalTransactions > 0
            ? Math.round((uniqueProtocolsUsed / totalTransactions) * 100 * 10) / 10
            : 0,
        yearStart: YEAR_START,
        yearEnd: YEAR_END,
        dataFetchedAt: new Date(),
    };
}

// === HELPER FUNCTIONS FOR NEW METRICS ===

// Base USDC contract address
const USDC_BASE = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';

// Known DEX routers to exclude from payment tracking
const DEX_ROUTERS = [
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', // Uniswap Universal Router
    '0x2626664c2603336e57b271c5c0b26f421741e481', // Uniswap V3 Router
    '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43', // Aerodrome
];

function isUsdcTransfer(transfer: { contractAddress: string }): boolean {
    return transfer.contractAddress?.toLowerCase() === USDC_BASE.toLowerCase();
}

function isDexTransfer(transfer: { from: string; to: string }): boolean {
    const fromLower = transfer.from?.toLowerCase();
    const toLower = transfer.to?.toLowerCase();
    return DEX_ROUTERS.some(router =>
        router.toLowerCase() === fromLower || router.toLowerCase() === toLower
    );
}

function calculateUsdcSent(
    tokenTransfers: { contractAddress: string; from: string; to: string; value: string }[],
    walletAddress: string
): number {
    const walletLower = walletAddress.toLowerCase();
    return tokenTransfers
        .filter(t =>
            isUsdcTransfer(t) &&
            t.from?.toLowerCase() === walletLower &&
            !isDexTransfer(t)
        )
        .reduce((sum, t) => sum + Number(t.value) / 1e6, 0); // USDC has 6 decimals
}

function calculateUsdcReceived(
    tokenTransfers: { contractAddress: string; from: string; to: string; value: string }[],
    walletAddress: string
): number {
    const walletLower = walletAddress.toLowerCase();
    return tokenTransfers
        .filter(t =>
            isUsdcTransfer(t) &&
            t.to?.toLowerCase() === walletLower &&
            !isDexTransfer(t)
        )
        .reduce((sum, t) => sum + Number(t.value) / 1e6, 0);
}

function getUniquePaymentRecipients(
    tokenTransfers: { contractAddress: string; from: string; to: string }[],
    walletAddress: string
): number {
    const walletLower = walletAddress.toLowerCase();
    const recipients = new Set(
        tokenTransfers
            .filter(t =>
                isUsdcTransfer(t) &&
                t.from?.toLowerCase() === walletLower &&
                !isDexTransfer(t)
            )
            .map(t => t.to?.toLowerCase())
    );
    return recipients.size;
}

function getLargestPayment(
    tokenTransfers: { contractAddress: string; from: string; to: string; value: string }[],
    walletAddress: string
): number {
    const walletLower = walletAddress.toLowerCase();
    const payments = tokenTransfers
        .filter(t =>
            isUsdcTransfer(t) &&
            t.from?.toLowerCase() === walletLower &&
            !isDexTransfer(t)
        )
        .map(t => Number(t.value) / 1e6);

    return payments.length > 0 ? Math.max(...payments) : 0;
}

function getMostExperimentalDay(
    transactions: { timeStamp: string; to: string }[]
): { date: string; uniqueContracts: number } | null {
    if (!transactions.length) return null;

    const dayContracts: Record<string, Set<string>> = {};

    transactions.forEach(tx => {
        const date = new Date(Number(tx.timeStamp) * 1000).toISOString().split('T')[0];
        if (!dayContracts[date]) {
            dayContracts[date] = new Set();
        }
        if (tx.to) {
            dayContracts[date].add(tx.to.toLowerCase());
        }
    });

    let maxDay = '';
    let maxContracts = 0;

    for (const [date, contracts] of Object.entries(dayContracts)) {
        if (contracts.size > maxContracts) {
            maxContracts = contracts.size;
            maxDay = date;
        }
    }

    return maxDay ? { date: maxDay, uniqueContracts: maxContracts } : null;
}

