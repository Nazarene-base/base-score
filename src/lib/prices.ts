// Price fetching utilities for real-time ETH price
// Uses CoinGecko free API

interface PriceCache {
    price: number;
    timestamp: number;
}

// Cache ETH price for 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;
let priceCache: PriceCache | null = null;

/**
 * Fetch current ETH price from CoinGecko (free, no API key required)
 * Falls back to a reasonable estimate if API fails
 */
export async function getEthPrice(): Promise<number> {
    // Check cache first
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL_MS) {
        console.log('💰 Using cached ETH price:', priceCache.price);
        return priceCache.price;
    }

    try {
        console.log('💰 Fetching ETH price from CoinGecko...');

        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            console.warn('⚠️ CoinGecko API error:', response.status);
            return getFallbackPrice();
        }

        const data = await response.json();
        const price = data?.ethereum?.usd;

        if (typeof price === 'number' && price > 0) {
            priceCache = { price, timestamp: Date.now() };
            console.log('✅ ETH price fetched:', price);
            return price;
        }

        return getFallbackPrice();
    } catch (error) {
        console.error('❌ Price fetch error:', error);
        return getFallbackPrice();
    }
}

/**
 * Fallback price when API is unavailable
 * Uses a reasonable estimate based on recent market conditions
 */
function getFallbackPrice(): number {
    // If we have a stale cache, use it
    if (priceCache) {
        console.log('ℹ️ Using stale cached price:', priceCache.price);
        return priceCache.price;
    }

    // Default fallback
    console.log('ℹ️ Using fallback ETH price: $3500');
    return 3500;
}

/**
 * Format USD amount for display
 */
export function formatUSD(amount: number): string {
    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 10000) {
        return `$${(amount / 1000).toFixed(1)}K`;
    }
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(2)}K`;
    }
    if (amount >= 1) {
        return `$${amount.toFixed(2)}`;
    }
    if (amount > 0) {
        return `$${amount.toFixed(4)}`;
    }
    return '$0';
}

/**
 * Format ETH amount for display
 */
export function formatETH(amount: number): string {
    if (amount >= 100) {
        return `${amount.toFixed(1)} ETH`;
    }
    if (amount >= 1) {
        return `${amount.toFixed(3)} ETH`;
    }
    if (amount >= 0.001) {
        return `${amount.toFixed(4)} ETH`;
    }
    return `${amount.toFixed(6)} ETH`;
}
