'use server';

import * as jose from 'jose';

const CDP_API_KEY_NAME = process.env.CDP_API_KEY_NAME;
const CDP_API_KEY_PRIVATE_KEY = process.env.CDP_API_KEY_PRIVATE_KEY;

// Only log in development
const isDev = process.env.NODE_ENV === 'development';
const log = (...args: unknown[]) => isDev && console.log('[CDP]', ...args);
const logError = (...args: unknown[]) => console.error('[CDP Error]', ...args);

// CDP API Host
const CDP_API_HOST = 'api.developer.coinbase.com';

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

        // Create abort controller with 10 second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // --- Token Balances API ---
        // Endpoint: GET /platform/v2/evm/token-balances/{network}/{address}
        const balancePathShort = `/platform/v2/evm/token-balances/${network}/${address}`;

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
        // Endpoint: GET /platform/v1/networks/{network}/addresses/{address}/transactions
        const historyPathShort = `/platform/v1/networks/${network}/addresses/${address}/transactions`;

        log('Generating JWT for history...');
        const historyJwt = await generateJwt('GET', historyPathShort);

        const historyPromise = fetch(`https://${CDP_API_HOST}${historyPathShort}?limit=100`, {
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
        const [balancesData, historyData] = await Promise.all([balancesPromise, historyPromise]);

        // Clear the timeout
        clearTimeout(timeoutId);

        // Check for API-level errors in response body
        checkApiError(balancesData);
        checkApiError(historyData);

        log('CDP data received successfully');

        return {
            success: true,
            data: {
                balances: balancesData,
                history: historyData,
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
