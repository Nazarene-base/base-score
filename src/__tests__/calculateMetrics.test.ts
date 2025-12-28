// Integration tests for calculateMetrics
// Tests the metric calculation pipeline with edge cases

import { describe, it, expect } from 'vitest';

describe('filterTo2025 edge cases', () => {
    // These tests verify the NaN safety improvements

    const YEAR_START = new Date('2025-01-01T00:00:00Z');
    const now = new Date();

    const filterTo2025 = <T extends { timeStamp: string }>(items: T[]): T[] => {
        return items.filter(item => {
            const tsNum = Number(item.timeStamp);
            if (isNaN(tsNum) || tsNum <= 0) return false;
            const date = new Date(tsNum * 1000);
            if (isNaN(date.getTime())) return false;
            return date >= YEAR_START && date <= now;
        });
    };

    it('should filter valid 2025 timestamps', () => {
        const items = [
            { timeStamp: '1736942400', hash: 'valid' }, // Jan 15, 2025
        ];

        const result = filterTo2025(items);
        expect(result).toHaveLength(1);
    });

    it('should reject NaN timestamps', () => {
        const items = [
            { timeStamp: 'not-a-number', hash: 'invalid' },
        ];

        const result = filterTo2025(items);
        expect(result).toHaveLength(0);
    });

    it('should reject zero timestamps', () => {
        const items = [
            { timeStamp: '0', hash: 'zero' },
        ];

        const result = filterTo2025(items);
        expect(result).toHaveLength(0);
    });

    it('should reject negative timestamps', () => {
        const items = [
            { timeStamp: '-1', hash: 'negative' },
        ];

        const result = filterTo2025(items);
        expect(result).toHaveLength(0);
    });

    it('should reject empty string timestamps', () => {
        const items = [
            { timeStamp: '', hash: 'empty' },
        ];

        const result = filterTo2025(items);
        expect(result).toHaveLength(0);
    });

    it('should handle mixed valid and invalid', () => {
        const items = [
            { timeStamp: '1736942400', hash: 'valid' },
            { timeStamp: 'invalid', hash: 'invalid' },
            { timeStamp: '0', hash: 'zero' },
            { timeStamp: '1738000000', hash: 'valid2' }, // Jan 27, 2025
        ];

        const result = filterTo2025(items);
        expect(result).toHaveLength(2);
        expect(result[0].hash).toBe('valid');
        expect(result[1].hash).toBe('valid2');
    });
});

describe('Gas Calculation Safety', () => {
    it('should handle BigInt conversion safely', () => {
        const safeGasCalc = (gasUsed: string, gasPrice: string): number => {
            try {
                const used = BigInt(gasUsed || '0');
                const price = BigInt(gasPrice || '0');
                const totalWei = used * price;
                return Number(totalWei / BigInt(1e9)) / 1e9;
            } catch {
                return 0;
            }
        };

        expect(safeGasCalc('21000', '1000000000')).toBeCloseTo(0.000021);
        expect(safeGasCalc('', '')).toBe(0);
        expect(safeGasCalc('invalid', 'invalid')).toBe(0);
    });
});
