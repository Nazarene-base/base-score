// Zod schemas for Basescan API responses
// Provides runtime validation to catch API shape changes early

import { z } from 'zod';

// Basescan Transaction Schema
export const BasescanTransactionSchema = z.object({
    hash: z.string(),
    timeStamp: z.string(),
    from: z.string(),
    to: z.string(),
    value: z.string(),
    gasUsed: z.string().optional(),
    gasPrice: z.string().optional(),
    functionName: z.string().optional(),
    isError: z.string().optional(),
    blockNumber: z.string().optional(),
    nonce: z.string().optional(),
    input: z.string().optional(),
}).passthrough();

// Basescan Token Transfer Schema
export const BasescanTokenTransferSchema = z.object({
    hash: z.string(),
    timeStamp: z.string(),
    from: z.string(),
    to: z.string(),
    contractAddress: z.string(),
    tokenName: z.string().optional(),
    tokenSymbol: z.string().optional(),
    value: z.string(),
    tokenDecimal: z.string().optional(),
}).passthrough();

// Basescan NFT Transfer Schema
export const BasescanNftTransferSchema = z.object({
    hash: z.string(),
    timeStamp: z.string(),
    from: z.string(),
    to: z.string(),
    contractAddress: z.string(),
    tokenName: z.string().optional(),
    tokenID: z.string().optional(),
}).passthrough();

// Basescan API Response Wrapper
export const BasescanApiResponseSchema = <T extends z.ZodTypeAny>(resultSchema: T) =>
    z.object({
        status: z.string(),
        message: z.string(),
        result: z.union([
            resultSchema,
            z.string(), // Error message when status is "0"
        ]),
    });

// Typed response schemas
export const BasescanTransactionResponseSchema = BasescanApiResponseSchema(
    z.array(BasescanTransactionSchema)
);

export const BasescanTokenTransferResponseSchema = BasescanApiResponseSchema(
    z.array(BasescanTokenTransferSchema)
);

export const BasescanNftTransferResponseSchema = BasescanApiResponseSchema(
    z.array(BasescanNftTransferSchema)
);

// Type exports
export type BasescanTransaction = z.infer<typeof BasescanTransactionSchema>;
export type BasescanTokenTransfer = z.infer<typeof BasescanTokenTransferSchema>;
export type BasescanNftTransfer = z.infer<typeof BasescanNftTransferSchema>;

/**
 * Validate and extract transactions from Basescan response
 * Returns empty array on validation failure (with logging)
 */
export function validateBasescanTransactions(response: unknown): BasescanTransaction[] {
    const parsed = BasescanTransactionResponseSchema.safeParse(response);

    if (!parsed.success) {
        console.error('[Basescan Schema] Validation failed:', parsed.error.format());
        return [];
    }

    if (parsed.data.status !== '1') {
        console.warn('[Basescan Schema] API returned non-success status:', parsed.data.message);
        return [];
    }

    if (typeof parsed.data.result === 'string') {
        console.warn('[Basescan Schema] API returned error string:', parsed.data.result);
        return [];
    }

    return parsed.data.result;
}

/**
 * Validate and extract token transfers from Basescan response
 */
export function validateBasescanTokenTransfers(response: unknown): BasescanTokenTransfer[] {
    const parsed = BasescanTokenTransferResponseSchema.safeParse(response);

    if (!parsed.success) {
        console.error('[Basescan Schema] Token transfer validation failed:', parsed.error.format());
        return [];
    }

    if (parsed.data.status !== '1' || typeof parsed.data.result === 'string') {
        return [];
    }

    return parsed.data.result;
}

/**
 * Validate and extract NFT transfers from Basescan response
 */
export function validateBasescanNftTransfers(response: unknown): BasescanNftTransfer[] {
    const parsed = BasescanNftTransferResponseSchema.safeParse(response);

    if (!parsed.success) {
        console.error('[Basescan Schema] NFT transfer validation failed:', parsed.error.format());
        return [];
    }

    if (parsed.data.status !== '1' || typeof parsed.data.result === 'string') {
        return [];
    }

    return parsed.data.result;
}
