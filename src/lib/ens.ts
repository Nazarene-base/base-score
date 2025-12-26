// ENS Resolution Utility
// Resolves both traditional .eth names (Ethereum mainnet) and .base.eth names (Base L2)
// FIX H-1: Added timeout support to prevent indefinite hangs

import { createPublicClient, http } from 'viem';
import { base, mainnet } from 'viem/chains';

// Constants
const ENS_TIMEOUT_MS = 10000; // 10 second timeout for ENS resolution
const isDev = process.env.NODE_ENV === 'development';
const log = (...args: unknown[]) => isDev && console.log('[ENS]', ...args);

// Base L2 client for .base.eth names
const baseClient = createPublicClient({
    chain: base,
    transport: http(
        process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
            ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
            : 'https://mainnet.base.org'
    ),
});

// Ethereum mainnet client for traditional .eth names
const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: http(
        process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
            ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
            : 'https://cloudflare-eth.com'
    ),
});

/**
 * Helper to add timeout to any promise (FIX H-1)
 */
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(errorMessage)), ms)
        ),
    ]);
}

/**
 * Check if a string looks like an ENS name
 */
export function isEnsName(input: string): boolean {
    const trimmed = input.trim().toLowerCase();
    return trimmed.endsWith('.eth') || trimmed.endsWith('.base.eth');
}

/**
 * Check if a string is a valid Ethereum address (M-3: Centralized validation)
 */
export function isValidAddress(input: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(input);
}

/**
 * Resolve an ENS name to an address
 * Supports both .eth (mainnet) and .base.eth (Base) names
 */
export async function resolveEnsName(name: string): Promise<string | null> {
    const normalizedName = name.trim().toLowerCase();

    // Is it a .base.eth name?
    if (normalizedName.endsWith('.base.eth')) {
        return resolveBasename(normalizedName);
    }

    // Is it a regular .eth name?
    if (normalizedName.endsWith('.eth')) {
        return resolveMainnetEns(normalizedName);
    }

    // Not an ENS name
    return null;
}

/**
 * Resolve a Base name (.base.eth) to an address
 * FIX H-1: Added timeout
 */
async function resolveBasename(name: string): Promise<string | null> {
    try {
        log('Resolving Basename:', name);

        const address = await withTimeout(
            baseClient.getEnsAddress({
                name: name,
                universalResolverAddress: '0xC625350928430e6115329961e93DeC90f8E29762',
            }),
            ENS_TIMEOUT_MS,
            'Basename resolution timed out'
        );

        if (address) {
            log('Resolved Basename:', name, '->', address);
            return address;
        }

        return null;
    } catch (error) {
        log('Basename resolution failed:', error);
        return null;
    }
}

/**
 * Resolve a traditional ENS name (.eth) to an address using Ethereum mainnet
 * FIX H-1: Added timeout
 */
async function resolveMainnetEns(name: string): Promise<string | null> {
    try {
        log('Resolving ENS (mainnet):', name);

        const address = await withTimeout(
            mainnetClient.getEnsAddress({
                name: name,
            }),
            ENS_TIMEOUT_MS,
            'ENS resolution timed out'
        );

        if (address) {
            log('Resolved ENS:', name, '->', address);
            return address;
        }

        return null;
    } catch (error) {
        log('ENS resolution failed:', error);
        return null;
    }
}

/**
 * Resolve input to an address
 * Handles: 0x addresses, .eth names, .base.eth names
 */
export async function resolveAddressOrName(input: string): Promise<{
    address: string | null;
    resolvedName: string | null;
    error: string | null;
}> {
    const trimmed = input.trim();

    // Already a valid address?
    if (isValidAddress(trimmed)) {
        return {
            address: trimmed,
            resolvedName: null,
            error: null,
        };
    }

    // Is it an ENS name?
    if (isEnsName(trimmed)) {
        const address = await resolveEnsName(trimmed);

        if (address) {
            return {
                address,
                resolvedName: trimmed.toLowerCase(),
                error: null,
            };
        }

        return {
            address: null,
            resolvedName: null,
            error: `Could not resolve "${trimmed}". Make sure the name exists.`,
        };
    }

    // Invalid input
    return {
        address: null,
        resolvedName: null,
        error: 'Please enter a valid address (0x...) or ENS name (.eth or .base.eth)',
    };
}

/**
 * Get basename for an address (reverse lookup on Base)
 * FIX H-1: Added timeout
 */
export async function getBasenameForAddress(address: string): Promise<string | null> {
    try {
        const name = await withTimeout(
            baseClient.getEnsName({
                address: address as `0x${string}`,
            }),
            ENS_TIMEOUT_MS,
            'Basename lookup timed out'
        );
        return name;
    } catch (error) {
        log('Error getting Basename:', error);
        return null;
    }
}

/**
 * Get mainnet ENS for an address (reverse lookup on mainnet)
 * FIX H-1: Added timeout
 */
export async function getEnsForAddress(address: string): Promise<string | null> {
    try {
        const name = await withTimeout(
            mainnetClient.getEnsName({
                address: address as `0x${string}`,
            }),
            ENS_TIMEOUT_MS,
            'ENS lookup timed out'
        );
        return name;
    } catch (error) {
        log('Error getting ENS:', error);
        return null;
    }
}
