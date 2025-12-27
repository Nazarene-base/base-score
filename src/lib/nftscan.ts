// NFTScan API client for Base Year Wrapped
// Provides detailed NFT data including collections, mints, and transfers

const NFTSCAN_API_BASE = 'https://baseapi.nftscan.com/api/v2';

interface NFTScanAsset {
    contract_address: string;
    contract_name: string;
    token_id: string;
    name: string;
    image_uri: string;
    mint_timestamp: number;
    mint_transaction_hash: string;
    owner: string;
}

interface NFTScanTransaction {
    hash: string;
    block_number: number;
    timestamp: number;
    transaction_type: 'mint' | 'transfer' | 'burn' | 'sale';
    send: string;
    receive: string;
    contract_address: string;
    contract_name: string;
    token_id: string;
    trade_price?: number;
    trade_symbol?: string;
}

interface NFTScanResponse<T> {
    code: number;
    msg: string;
    data: T;
}

interface NFTsByAccountData {
    content: NFTScanAsset[];
    total: number;
    next: string;
}

interface TransactionsByAccountData {
    content: NFTScanTransaction[];
    total: number;
    next: string;
}

async function getNFTScanApiKey(): Promise<string> {
    const key = process.env.NFTSCAN_API_KEY;
    if (!key) {
        throw new Error('NFTSCAN_API_KEY not configured');
    }
    return key;
}

/**
 * Get all NFTs owned by an address
 */
export async function getNFTsByAccount(walletAddress: string): Promise<{
    assets: NFTScanAsset[];
    total: number;
}> {
    try {
        const apiKey = await getNFTScanApiKey();

        const response = await fetch(
            `${NFTSCAN_API_BASE}/account/own/all/${walletAddress}?erc_type=erc721&show_attribute=false&limit=100`,
            {
                headers: {
                    'X-API-KEY': apiKey,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error('NFTScan API error:', await response.text());
            return { assets: [], total: 0 };
        }

        const data: NFTScanResponse<NFTsByAccountData> = await response.json();

        if (data.code !== 200) {
            console.error('NFTScan error:', data.msg);
            return { assets: [], total: 0 };
        }

        return {
            assets: data.data.content || [],
            total: data.data.total || 0,
        };
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        return { assets: [], total: 0 };
    }
}

/**
 * Get NFT transactions for an address (mints, transfers, sales)
 */
export async function getNFTTransactions(walletAddress: string): Promise<{
    transactions: NFTScanTransaction[];
    total: number;
}> {
    try {
        const apiKey = await getNFTScanApiKey();

        const response = await fetch(
            `${NFTSCAN_API_BASE}/transactions/account/${walletAddress}?limit=100`,
            {
                headers: {
                    'X-API-KEY': apiKey,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.error('NFTScan transactions API error:', await response.text());
            return { transactions: [], total: 0 };
        }

        const data: NFTScanResponse<TransactionsByAccountData> = await response.json();

        if (data.code !== 200) {
            console.error('NFTScan error:', data.msg);
            return { transactions: [], total: 0 };
        }

        return {
            transactions: data.data.content || [],
            total: data.data.total || 0,
        };
    } catch (error) {
        console.error('Error fetching NFT transactions:', error);
        return { transactions: [], total: 0 };
    }
}

/**
 * Calculate NFT statistics from NFTScan data
 * BUG-M2 FIX: Accept ethPrice as parameter instead of hardcoding
 */
export async function getNFTStats(walletAddress: string, ethPrice: number = 3500): Promise<{
    totalOwned: number;
    minted: number;
    collected: number;
    favoriteCollection: string;
    totalSpentUSD: number;
    collections: { name: string; count: number }[];
}> {
    const startOf2025 = new Date('2025-01-01').getTime() / 1000;

    try {
        const [assets, txData] = await Promise.all([
            getNFTsByAccount(walletAddress),
            getNFTTransactions(walletAddress),
        ]);

        // Filter to 2025 transactions
        const txs2025 = txData.transactions.filter(tx => tx.timestamp >= startOf2025);

        // Count mints (from zero address)
        const mints = txs2025.filter(tx =>
            tx.transaction_type === 'mint' &&
            tx.receive.toLowerCase() === walletAddress.toLowerCase()
        );

        // Count received (not mints)
        const collected = txs2025.filter(tx =>
            tx.transaction_type === 'transfer' &&
            tx.receive.toLowerCase() === walletAddress.toLowerCase() &&
            tx.send !== '0x0000000000000000000000000000000000000000'
        );

        // Get collection counts from current holdings
        const collectionCounts: Record<string, number> = {};
        assets.assets.forEach(asset => {
            const name = asset.contract_name || 'Unknown';
            collectionCounts[name] = (collectionCounts[name] || 0) + 1;
        });

        const sortedCollections = Object.entries(collectionCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count }));

        // Calculate total spent (from sales data) - BUG-M2 FIX: Use dynamic ethPrice
        let totalSpentUSD = 0;
        txs2025.forEach(tx => {
            if (tx.receive.toLowerCase() === walletAddress.toLowerCase() && tx.trade_price) {
                totalSpentUSD += tx.trade_price * ethPrice;
            }
        });

        return {
            totalOwned: assets.total,
            minted: mints.length,
            collected: collected.length,
            favoriteCollection: sortedCollections[0]?.name || 'None',
            totalSpentUSD,
            collections: sortedCollections.slice(0, 5),
        };
    } catch (error) {
        console.error('Error calculating NFT stats:', error);
        return {
            totalOwned: 0,
            minted: 0,
            collected: 0,
            favoriteCollection: 'None',
            totalSpentUSD: 0,
            collections: [],
        };
    }
}
