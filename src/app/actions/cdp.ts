'use server';

import * as jose from 'jose';

const CDP_API_KEY_NAME = process.env.CDP_API_KEY_NAME;
const CDP_API_KEY_PRIVATE_KEY = process.env.CDP_API_KEY_PRIVATE_KEY;

// PRODUCTION LOGGING ENABLED: For debugging "No 2025 Activity" issue
// TODO: Revert to development-only logging after issue is resolved
const log = (...args: unknown[]) => console.log('[CDP]', ...args);
const logError = (...args: unknown[]) => console.error('[CDP Error]', ...args);

// CDP API Host - Updated to new CDP API domain (Dec 2024)
// Old: api.developer.coinbase.com (deprecated)
// New: api.cdp.coinbase.com
const CDP_API_HOST = 'api.cdp.coinbase.com';

/**
 * Generate a JWT for CDP API authentication.
 * CDP uses EdDSA (Ed25519) for new API keys.
 */
async function generateJwt(requestMethod: string, requestPath: string): Promise<string> {
    if (!CDP_API_KEY_NAME || !CDP_API_KEY_PRIVATE_KEY) {
        throw new Error('Missing CDP Credentials - check environment variables');
    }

    // The URI claim format: "METHOD host/path"
    const uri = `${requestMethod} ${CDP_API_HOST}${requestPath}`;

    // Format the private key
    // CDP provides Ed25519 keys as raw base64 (64 bytes: 32-byte seed + 32-byte public key)
    let privateKey: CryptoKey;

    try {
        const keyString = CDP_API_KEY_PRIVATE_KEY;

        // Check if it's already PEM formatted
        if (keyString.includes('-----BEGIN')) {
            privateKey = await jose.importPKCS8(keyString, 'EdDSA');
        } else {
            // CDP provides raw base64 key - decode and create JWK
            const keyBytes = Buffer.from(keyString, 'base64');

            log(`Key bytes length: ${keyBytes.length}`);

            if (keyBytes.length === 64) {
                // Ed25519 key: first 32 bytes = private seed, last 32 bytes = public key
                const privateBytes = keyBytes.slice(0, 32);
                const publicBytes = keyBytes.slice(32, 64);

                // Create an OKP (Octet Key Pair) JWK for Ed25519
                const jwk = {
                    kty: 'OKP' as const,
                    crv: 'Ed25519',
                    d: Buffer.from(privateBytes).toString('base64url'),
                    x: Buffer.from(publicBytes).toString('base64url'),
                };

                privateKey = await jose.importJWK(jwk, 'EdDSA') as CryptoKey;
                log('Successfully imported Ed25519 key from 64-byte format');
            } else if (keyBytes.length === 32) {
                // Just the private seed - need to derive public key
                // For now, try as raw seed
                const jwk = {
                    kty: 'OKP' as const,
                    crv: 'Ed25519',
                    d: Buffer.from(keyBytes).toString('base64url'),
                };
                privateKey = await jose.importJWK(jwk, 'EdDSA') as CryptoKey;
                log('Successfully imported Ed25519 key from 32-byte seed');
            } else {
                throw new Error(`Unexpected key length: ${keyBytes.length} bytes (expected 32 or 64)`);
            }
        }
    } catch (keyError) {
        logError('Failed to import private key:', keyError);
        throw new Error('Invalid CDP private key format');
    }

    const now = Math.floor(Date.now() / 1000);

    const jwt = await new jose.SignJWT({
        uri,
    })
        .setProtectedHeader({
            alg: 'EdDSA',
            kid: CDP_API_KEY_NAME,
            nonce: crypto.randomUUID(),
            typ: 'JWT',
        })
        .setIssuer('cdp')
        .setSubject(CDP_API_KEY_NAME)
        .setAudience('cdp_service')
        .setNotBefore(now)
        .setIssuedAt(now)
        .setExpirationTime(now + 120) // 2 minutes
        .sign(privateKey);

    return jwt;
}

/**
 * Validate Ethereum address format
 */
function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if CDP API response contains an error
 */
function checkApiError(response: unknown): void {
    if (response && typeof response === 'object') {
        const resp = response as Record<string, unknown>;
        if (resp.error || resp.code || resp.message) {
            throw new Error(
                `CDP API Error: ${JSON.stringify(resp.error || resp.message || resp.code)}`
            );
        }
    }
}

/**
 * Fetch wallet data from CDP APIs
 * Returns balances and transaction history for a given address
 */
export async function getCdpWalletData(address: string) {
    // Validate address format
    if (!isValidAddress(address)) {
        return {
            success: false,
            error: 'Invalid wallet address format',
        };
    }

    // Check credentials exist
    if (!CDP_API_KEY_NAME || !CDP_API_KEY_PRIVATE_KEY) {
        log('CDP credentials not configured, skipping');
        return {
            success: false,
            error: 'CDP credentials not configured',
        };
    }

    try {
        const network = 'base-mainnet';

        // Create abort controller with 25 second timeout (increased from 10s - BUG-C1 FIX)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        // --- Token Balances API ---
        // NEW v2 Endpoint: GET /platform/v2/data/evm/token-balances/{network}/{address}
        // Network uses simple names like 'base' instead of 'base-mainnet'
        const balanceNetwork = 'base';
        const balancePathShort = `/platform/v2/data/evm/token-balances/${balanceNetwork}/${address}`;

        log('Generating JWT for balances...');
        const balancesJwt = await generateJwt('GET', balancePathShort);

        const balancesPromise = fetch(`https://${CDP_API_HOST}${balancePathShort}`, {
            headers: {
                'Authorization': `Bearer ${balancesJwt}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Always fetch fresh data
            signal: controller.signal,
        }).then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Balances API HTTP ${res.status}: ${text}`);
            }
            return res.json();
        });

        // --- Transaction History API ---
        // NEW v2 Endpoint: Try the new data API path
        // Note: The transaction history API may not be available in v2 yet
        // Fallback to v1 format which may still work
        const historyPathShort = `/platform/v1/networks/${network}/addresses/${address}/transactions`;

        log('Generating JWT for history...');
        const historyJwt = await generateJwt('GET', historyPathShort);

        const historyPromise = fetch(`https://${CDP_API_HOST}${historyPathShort}?limit=500`, {
            headers: {
                'Authorization': `Bearer ${historyJwt}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
            signal: controller.signal,
        }).then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`History API HTTP ${res.status}: ${text}`);
            }
            return res.json();
        });

        // Execute both requests in parallel
        log('Fetching data from CDP...');

        let balancesData, historyData;
        try {
            [balancesData, historyData] = await Promise.all([balancesPromise, historyPromise]);
        } finally {
            // BUG-1 FIX: Always clear timeout, even on error
            clearTimeout(timeoutId);
        }

        // Check for API-level errors in response body
        checkApiError(balancesData);
        checkApiError(historyData);

        // COMPREHENSIVE LOGGING: For debugging "No 2025 Activity" issue
        log('CDP balances response:', {
            keys: Object.keys(balancesData || {}),
            type: typeof balancesData,
            isArray: Array.isArray(balancesData),
        });
        log('CDP history response:', {
            keys: Object.keys(historyData || {}),
            type: typeof historyData,
            isArray: Array.isArray(historyData),
        });

        // ROBUST TRANSACTION EXTRACTION: Handle various API response formats
        // Try multiple possible nested paths for transaction data
        let historyItems: unknown[] = [];
        if (Array.isArray(historyData)) {
            historyItems = historyData;
        } else if (historyData && typeof historyData === 'object') {
            // Try common nested paths in order of likelihood
            historyItems =
                historyData.transactions ||  // CDP format
                historyData.data ||          // Generic wrapper
                historyData.items ||         // Pagination format
                historyData.results ||       // Results wrapper
                historyData.records ||       // Records format
                [];

            // If still empty but has nested pagination, check for items inside data
            if (historyItems.length === 0 && historyData.data && typeof historyData.data === 'object') {
                const nestedData = historyData.data as Record<string, unknown>;
                historyItems =
                    (nestedData.transactions as unknown[]) ||
                    (nestedData.items as unknown[]) ||
                    [];
            }
        }

        // Log detailed transaction info for debugging
        log('CDP transactions extracted:', {
            count: Array.isArray(historyItems) ? historyItems.length : 'N/A',
            sampleKeys: Array.isArray(historyItems) && historyItems.length > 0
                ? Object.keys(historyItems[0] as object)
                : 'no data',
            firstTimestamp: Array.isArray(historyItems) && historyItems.length > 0
                ? (historyItems[0] as { block_timestamp?: unknown; timestamp?: unknown }).block_timestamp ||
                (historyItems[0] as { block_timestamp?: unknown; timestamp?: unknown }).timestamp
                : 'no data',
        });

        log('CDP data received successfully');

        return {
            success: true,
            data: {
                balances: balancesData,
                history: historyData,
                // FIX: Return pre-extracted transactions to avoid double extraction
                transactions: historyItems as any[],
            },
        };

    } catch (error) {
        logError('Error fetching CDP data:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown CDP error',
        };
    }
}
