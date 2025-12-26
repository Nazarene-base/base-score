// Wrapped Data Cache API
// Provides caching layer for wrapped data using in-memory cache
// Memory-only implementation - Vercel KV can be added separately if needed

import { WrappedData } from '@/types/wrapped';

// In-memory cache
interface CacheEntry {
    data: WrappedData;
    timestamp: number;
    address: string;
}

// Cache TTL: 24 hours for wrapped data (it's historical, doesn't change often)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// In-memory cache store
const memoryCache = new Map<string, CacheEntry>();

/**
 * Generate cache key for wrapped data
 */
function getCacheKey(address: string, year: number = 2025): string {
    return `wrapped:${address.toLowerCase()}:${year}`;
}

/**
 * Get cached wrapped data
 */
export async function getCachedWrappedData(
    address: string,
    year: number = 2025
): Promise<WrappedData | null> {
    const cacheKey = getCacheKey(address, year);

    // Check memory cache
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        console.log('✅ Cache hit (memory):', address.slice(0, 10));
        return cached.data;
    }

    return null;
}

/**
 * Set cached wrapped data
 */
export async function setCachedWrappedData(
    address: string,
    data: WrappedData,
    year: number = 2025
): Promise<void> {
    const cacheKey = getCacheKey(address, year);
    const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        address: address.toLowerCase(),
    };

    // Save to memory cache
    memoryCache.set(cacheKey, entry);
    console.log('✅ Cached to memory:', address.slice(0, 10));

    // Limit memory cache size (prevent memory leaks)
    if (memoryCache.size > 1000) {
        // Remove oldest entries
        const entries = Array.from(memoryCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        for (let i = 0; i < 100; i++) {
            memoryCache.delete(entries[i][0]);
        }
    }
}

/**
 * Invalidate cached wrapped data
 */
export async function invalidateCache(
    address: string,
    year: number = 2025
): Promise<void> {
    const cacheKey = getCacheKey(address, year);
    memoryCache.delete(cacheKey);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { memoryCacheSize: number } {
    return {
        memoryCacheSize: memoryCache.size,
    };
}

/**
 * Clear all cache (useful for development)
 */
export function clearAllCache(): void {
    memoryCache.clear();
    console.log('🗑️ Cache cleared');
}
