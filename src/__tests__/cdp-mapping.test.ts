// Integration tests for CDP data mapping
// Tests the full pipeline: raw API response -> mapped transactions

import { describe, it, expect, beforeAll } from 'vitest';
import { mapCdpHistoryToBasescan } from '@/lib/cdp-mapping';
import { extractCdpTransactions } from '@/lib/schemas/cdp';
import {
    cdpResponseDirect,
    cdpResponseWrappedTransactions,
    cdpResponseWrappedData,
    cdpResponseNestedData,
    cdpResponseEmpty,
    cdpResponse2024,
    cdpResponseMixedYears,
} from './fixtures/cdp-response';

describe('CDP Data Mapping', () => {
    describe('mapCdpHistoryToBasescan', () => {
        it('should map direct array response correctly', () => {
            const result = mapCdpHistoryToBasescan(cdpResponseDirect);

            expect(result).toHaveLength(2);
            expect(result[0].hash).toBe('0x123abc');
            expect(result[0].from).toBe('0xsender');
            expect(result[0].to).toBe('0xrecipient');
            expect(result[0].value).toBe('1000000000000000000');
        });

        it('should parse ISO timestamp to Unix seconds', () => {
            const result = mapCdpHistoryToBasescan(cdpResponseDirect);

            // 2025-01-15T12:00:00Z = 1736942400
            expect(result[0].timeStamp).toBe('1736942400');
        });

        it('should parse Unix seconds timestamp', () => {
            const result = mapCdpHistoryToBasescan(cdpResponseWrappedTransactions.transactions);

            // 1737100800 should stay as is
            expect(result[0].timeStamp).toBe('1737100800');
        });

        it('should parse Unix milliseconds and convert to seconds', () => {
            const result = mapCdpHistoryToBasescan(cdpResponseNestedData.data.transactions);

            // 1737273600000 ms -> 1737273600 seconds
            expect(result[0].timeStamp).toBe('1737273600');
        });

        it('should parse string Unix timestamp', () => {
            const result = mapCdpHistoryToBasescan(cdpResponseWrappedData.data);

            expect(result[0].timeStamp).toBe('1737187200');
        });

        it('should handle empty array', () => {
            const result = mapCdpHistoryToBasescan([]);
            expect(result).toHaveLength(0);
        });

        it('should handle non-array input', () => {
            const result = mapCdpHistoryToBasescan(null as any);
            expect(result).toHaveLength(0);
        });

        it('should provide safe gas defaults', () => {
            const txWithoutGas = [{ block_timestamp: '2025-01-15T12:00:00Z' }];
            const result = mapCdpHistoryToBasescan(txWithoutGas);

            expect(result[0].gasUsed).toBe('21000');
            expect(result[0].gasPrice).toBe('1000000');
        });
    });

    describe('extractCdpTransactions (Zod validation)', () => {
        it('should extract from direct array', () => {
            const result = extractCdpTransactions(cdpResponseDirect);
            expect(result).toHaveLength(2);
        });

        it('should extract from wrapped transactions', () => {
            const result = extractCdpTransactions(cdpResponseWrappedTransactions);
            expect(result).toHaveLength(1);
        });

        it('should extract from wrapped data array', () => {
            const result = extractCdpTransactions(cdpResponseWrappedData);
            expect(result).toHaveLength(1);
        });

        it('should extract from nested data.transactions', () => {
            const result = extractCdpTransactions(cdpResponseNestedData);
            expect(result).toHaveLength(1);
        });

        it('should return empty array for empty transactions', () => {
            const result = extractCdpTransactions(cdpResponseEmpty);
            expect(result).toHaveLength(0);
        });
    });
});

describe('2025 Filtering', () => {
    it('should correctly identify 2025 transactions', () => {
        const mapped = mapCdpHistoryToBasescan(cdpResponseMixedYears);

        // Filter to 2025
        const YEAR_START = new Date('2025-01-01T00:00:00Z');
        const now = new Date();

        const txs2025 = mapped.filter(tx => {
            const tsNum = Number(tx.timeStamp);
            if (isNaN(tsNum) || tsNum <= 0) return false;
            const date = new Date(tsNum * 1000);
            return date >= YEAR_START && date <= now;
        });

        expect(txs2025).toHaveLength(1);
        expect(txs2025[0].hash).toBe('0x2025tx');
    });

    it('should filter out pre-2025 transactions', () => {
        const mapped = mapCdpHistoryToBasescan(cdpResponse2024);

        const YEAR_START = new Date('2025-01-01T00:00:00Z');
        const now = new Date();

        const txs2025 = mapped.filter(tx => {
            const tsNum = Number(tx.timeStamp);
            if (isNaN(tsNum) || tsNum <= 0) return false;
            const date = new Date(tsNum * 1000);
            return date >= YEAR_START && date <= now;
        });

        expect(txs2025).toHaveLength(0);
    });
});
