// Utility to fetch token prices from GeckoTerminal and DexScreener
// FIX M-2: Added timeouts to prevent indefinite hangs
// FIX M-5: Conditional logging for development only

const GECKO_API_URL = 'https://api.geckoterminal.com/api/v2';
const DEXSCREENER_API_URL = 'https://api.dexscreener.com/latest/dex/tokens';
const NETWORK = 'base';
const PRICE_TIMEOUT_MS = 5000; // 5 second timeout

// Conditional logging (FIX M-5)
const isDev = process.env.NODE_ENV === 'development';
const log = (...args: unknown[]) => isDev && console.log('[Price]', ...args);
const logWarn = (...args: unknown[]) => isDev && console.warn('[Price]', ...args);

export interface TokenPrice {
    address: string;
    priceUSD: number;
}

/**
 * Fetch with timeout helper (FIX M-2)
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PRICE_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Fetch prices from DexScreener (Fallback)
 * FIX M-2: Added timeout
 */
async function getDexScreenerPrices(addresses: string[]): Promise<Record<string, number>> {
    if (addresses.length === 0) return {};

    // DexScreener allows up to 30 addresses
    const uniqueAddresses = Array.from(new Set(addresses.map(a => a.toLowerCase()))).slice(0, 30);
    const addressString = uniqueAddresses.join(',');

    log(`Fetching DexScreener fallback for ${uniqueAddresses.length} tokens...`);

    try {
        const response = await fetchWithTimeout(`${DEXSCREENER_API_URL}/${addressString}`);

        if (!response.ok) {
            logWarn('DexScreener Error:', response.status);
            return {};
        }

        const data = await response.json();
        const prices: Record<string, number> = {};

        // Data format: { pairs: [{ baseToken: { address: "..." }, priceUsd: "..." }] }
        // Note: Multiple pairs may exist for one token, we take the most liquid/first one usually returned
        if (data.pairs && Array.isArray(data.pairs)) {
            data.pairs.forEach((pair: any) => {
                if (pair.baseToken && pair.baseToken.address && pair.priceUsd) {
                    const addr = pair.baseToken.address.toLowerCase();
                    // Only set if not already set (DexScreener might return multiple pairs, first is best)
                    if (!prices[addr]) {
                        prices[addr] = Number(pair.priceUsd);
                    }
                }
            });
        }

        return prices;
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            logWarn('DexScreener request timed out');
        } else {
            logWarn('DexScreener Exception:', err);
        }
        return {};
    }
}

/**
 * Fetch current prices for multiple tokens on Base
 * Strategy: GeckoTerminal -> Fallback to DexScreener
 * FIX M-2: Added timeout
 */
export async function getTokenPrices(addresses: string[]): Promise<Record<string, number>> {
    if (addresses.length === 0) return {};

    const uniqueAddresses = Array.from(new Set(addresses.map(a => a.toLowerCase()))).slice(0, 30);
    const addressString = uniqueAddresses.join(',');

    log(`Fetching prices for ${uniqueAddresses.length} tokens...`);

    let prices: Record<string, number> = {};

    // 1. Try GeckoTerminal
    try {
        const url = `${GECKO_API_URL}/simple/networks/${NETWORK}/token_price/${addressString}`;
        const headers: HeadersInit = { 'Accept': 'application/json' };

        const response = await fetchWithTimeout(url, { headers });

        if (response.ok) {
            const data = await response.json();
            const priceMap = data.data?.attributes?.token_prices || {};

            Object.entries(priceMap).forEach(([addr, price]) => {
                prices[addr.toLowerCase()] = Number(price);
            });
            log(`GeckoTerminal found ${Object.keys(prices).length} prices`);
        } else {
            logWarn('GeckoTerminal failed, trying fallback...');
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            logWarn('GeckoTerminal request timed out');
        } else {
            logWarn('GeckoTerminal fetch error:', error);
        }
    }

    // 2. Identify missing tokens and try DexScreener
    const missingTokens = uniqueAddresses.filter(addr => !prices[addr]);

    if (missingTokens.length > 0) {
        log(`${missingTokens.length} tokens missing prices, trying DexScreener...`);
        const fallbackPrices = await getDexScreenerPrices(missingTokens);

        // Merge fallback prices
        Object.entries(fallbackPrices).forEach(([addr, price]) => {
            prices[addr] = price;
        });
        log(`DexScreener found ${Object.keys(fallbackPrices).length} missing prices`);
    }

    return prices;
}
