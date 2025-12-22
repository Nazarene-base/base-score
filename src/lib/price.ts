// Utility to fetch token prices from GeckoTerminal
const BASE_API_URL = 'https://api.geckoterminal.com/api/v2';
const NETWORK = 'base';

export interface TokenPrice {
    address: string;
    priceUSD: number;
}

/**
 * Fetch current prices for multiple tokens on Base
 * Uses GeckoTerminal Simple Token Price Endpoint
 */
export async function getTokenPrices(addresses: string[]): Promise<Record<string, number>> {
    if (addresses.length === 0) return {};

    // GeckoTerminal allows up to 30 addresses per request
    // We'll take the top 30 unique addresses to avoid rate limits/errors for now
    const uniqueAddresses = Array.from(new Set(addresses.map(a => a.toLowerCase()))).slice(0, 30);
    const addressString = uniqueAddresses.join(',');

    console.log(`🦎 Fetching prices for ${uniqueAddresses.length} tokens...`);

    try {
        const url = `${BASE_API_URL}/simple/networks/${NETWORK}/token_price/${addressString}`;

        // Check if we have a key (though GeckoTerminal public API is often free without one for low volume)
        // We add it as a header just in case it's a Pro key applicable here or helpful
        const headers: HeadersInit = {
            'Accept': 'application/json'
        };

        // Note: The user provided a "CG-" key. If this is a CoinGecko Pro key, it might need 
        // to be passed via specific query param 'x_cg_pro_api_key' or header.
        // However, GeckoTerminal API docs usually don't require keys for simple usage.
        // We will try without first, as 'api.geckoterminal.com' is the public endpoint.
        // If we wanted to use the Authenticated endpoint, logic might differ.

        const response = await fetch(url, { headers });

        if (!response.ok) {
            console.error('🦎 Price Fetch Error:', response.status, response.statusText);
            return {};
        }

        const data = await response.json();

        // Response format: 
        // {
        //   "data": {
        //     "attributes": {
        //       "token_prices": {
        //         "0x...": "1.23",
        //         "0x...": "0.45"
        //       }
        //     }
        //   }
        // }

        const prices: Record<string, number> = {};
        const priceMap = data.data?.attributes?.token_prices || {};

        Object.entries(priceMap).forEach(([addr, price]) => {
            prices[addr.toLowerCase()] = Number(price);
        });

        console.log(`✅ Got prices for ${Object.keys(prices).length} tokens`);
        return prices;

    } catch (error) {
        console.error('🦎 Fetch Error:', error);
        return {};
    }
}
