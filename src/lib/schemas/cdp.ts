// Zod schemas for CDP API responses
// Provides runtime validation to catch API shape changes early

import { z } from 'zod';

// Flexible timestamp that accepts multiple formats
export const FlexibleTimestampSchema = z.union([
    z.string(),
    z.number(),
]).optional();

// CDP Transaction Schema
export const CdpTransactionSchema = z.object({
    // Transaction identifiers - accept multiple field names
    transaction_id: z.string().optional(),
    transaction_hash: z.string().optional(),
    hash: z.string().optional(),

    // Timestamp - accepts ISO string or Unix timestamp
    block_timestamp: FlexibleTimestampSchema,
    timestamp: FlexibleTimestampSchema,
    time: FlexibleTimestampSchema,

    // Block info
    block_number: z.union([z.number(), z.string()]).optional(),
    blockNumber: z.union([z.number(), z.string()]).optional(),

    // Addresses
    from_address: z.string().optional(),
    from: z.string().optional(),
    to_address: z.string().optional(),
    to: z.string().optional(),

    // Values
    value: z.string().optional(),

    // Gas
    gas_used: z.union([z.string(), z.number()]).optional(),
    gasUsed: z.union([z.string(), z.number()]).optional(),
    gas: z.union([z.string(), z.number()]).optional(),
    gas_price: z.union([z.string(), z.number()]).optional(),
    gasPrice: z.union([z.string(), z.number()]).optional(),
    effectiveGasPrice: z.union([z.string(), z.number()]).optional(),

    // Other fields
    input: z.string().optional(),
    nonce: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(),
    transaction_type: z.string().optional(),
}).passthrough(); // Allow additional unknown fields

// CDP Transaction Array Schema
export const CdpTransactionArraySchema = z.array(CdpTransactionSchema);

// CDP History Response - handles various wrapper formats
export const CdpHistoryResponseSchema = z.union([
    // Direct array
    CdpTransactionArraySchema,
    // Wrapped in transactions
    z.object({
        transactions: CdpTransactionArraySchema,
    }).passthrough(),
    // Wrapped in data
    z.object({
        data: z.union([
            CdpTransactionArraySchema,
            z.object({
                transactions: CdpTransactionArraySchema,
            }).passthrough(),
            z.object({
                items: CdpTransactionArraySchema,
            }).passthrough(),
        ]),
    }).passthrough(),
    // Wrapped in items (pagination)
    z.object({
        items: CdpTransactionArraySchema,
    }).passthrough(),
    // Wrapped in results
    z.object({
        results: CdpTransactionArraySchema,
    }).passthrough(),
    // Wrapped in records
    z.object({
        records: CdpTransactionArraySchema,
    }).passthrough(),
]);

// CDP Token Balance Schema
export const CdpTokenBalanceSchema = z.object({
    contract_address: z.string().optional(),
    symbol: z.string().optional(),
    name: z.string().optional(),
    decimals: z.number().optional(),
    balance: z.string().optional(),
}).passthrough();

export const CdpBalancesResponseSchema = z.union([
    z.array(CdpTokenBalanceSchema),
    z.object({
        balances: z.array(CdpTokenBalanceSchema),
    }).passthrough(),
    z.object({
        data: z.array(CdpTokenBalanceSchema),
    }).passthrough(),
]);

// Type exports
export type CdpTransaction = z.infer<typeof CdpTransactionSchema>;
export type CdpHistoryResponse = z.infer<typeof CdpHistoryResponseSchema>;
export type CdpTokenBalance = z.infer<typeof CdpTokenBalanceSchema>;

/**
 * Safely parse and extract transactions from CDP response
 * Throws descriptive error if validation fails
 */
export function extractCdpTransactions(response: unknown): CdpTransaction[] {
    // Validate the response structure
    const parsed = CdpHistoryResponseSchema.safeParse(response);

    if (!parsed.success) {
        console.error('[CDP Schema] Validation failed:', parsed.error.format());
        throw new Error(`CDP response validation failed: ${parsed.error.message}`);
    }

    const data = parsed.data;

    // Extract array based on wrapper type
    if (Array.isArray(data)) {
        return data;
    }

    // Type-safe property checks using type guards
    if (typeof data === 'object' && data !== null) {
        if ('transactions' in data && Array.isArray(data.transactions)) {
            return data.transactions as CdpTransaction[];
        }

        if ('data' in data) {
            const inner = data.data;
            if (Array.isArray(inner)) {
                return inner as CdpTransaction[];
            }
            if (typeof inner === 'object' && inner !== null) {
                if ('transactions' in inner && Array.isArray(inner.transactions)) {
                    return inner.transactions as CdpTransaction[];
                }
                if ('items' in inner && Array.isArray(inner.items)) {
                    return inner.items as CdpTransaction[];
                }
            }
        }

        if ('items' in data && Array.isArray(data.items)) {
            return data.items as CdpTransaction[];
        }
        if ('results' in data && Array.isArray(data.results)) {
            return data.results as CdpTransaction[];
        }
        if ('records' in data && Array.isArray(data.records)) {
            return data.records as CdpTransaction[];
        }
    }

    return [];
}
