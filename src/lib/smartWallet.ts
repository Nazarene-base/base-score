// Smart Wallet Detection Utilities
// Detects ERC-4337 smart wallets and gasless transactions

import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Known smart wallet factory addresses on Base
const SMART_WALLET_FACTORIES = [
    '0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a', // Coinbase Smart Wallet Factory
    '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789', // ERC-4337 EntryPoint
    '0x0000000071727de22e5e9d8baf0edac6f37da032', // ERC-4337 EntryPoint v0.7
];

// Known Paymaster addresses (for gasless transactions)
const PAYMASTER_ADDRESSES = [
    '0x2eeda93db4ec2b9f1cab7c2e5d3b9b9a7f2ec9e7', // Coinbase Paymaster
    '0x00000000000000f0abaffeb9b4be0000000000ac', // Pimlico Paymaster
];

/**
 * Check if an address is a smart wallet by looking for code
 */
export async function isSmartWallet(address: string): Promise<boolean> {
    try {
        const client = createPublicClient({
            chain: base,
            transport: http(),
        });

        // Check if the address has code (is a contract)
        const code = await client.getCode({ address: address as `0x${string}` });

        // EOAs have no code, smart wallets do
        const hasCode = Boolean(code && code !== '0x');

        if (hasCode) {
            console.log('🧠 Smart wallet detected:', address.slice(0, 10));
        }

        return hasCode;
    } catch (error) {
        console.error('❌ Smart wallet check error:', error);
        return false;
    }
}

/**
 * Detect smart wallet usage from transaction history
 * Looks for transactions involving smart wallet factories or paymasters
 */
export function detectSmartWalletFromTxs(
    transactions: { from: string; to: string; hash: string }[],
    walletAddress: string
): { hasSmartWallet: boolean; gaslessCount: number } {
    const walletLower = walletAddress.toLowerCase();
    let hasSmartWallet = false;
    let gaslessCount = 0;

    transactions.forEach(tx => {
        const toLower = tx.to?.toLowerCase() || '';
        const fromLower = tx.from?.toLowerCase() || '';

        // Check if transaction involves a smart wallet factory
        if (SMART_WALLET_FACTORIES.some(f => f.toLowerCase() === toLower)) {
            hasSmartWallet = true;
        }

        // Check if transaction was sponsored (via paymaster)
        // This is a simplified check - real detection would look at UserOp data
        if (PAYMASTER_ADDRESSES.some(p => p.toLowerCase() === fromLower)) {
            gaslessCount++;
        }
    });

    // If user's address has transactions FROM it but the address is a contract, it's a smart wallet
    // This additional check would require isSmartWallet() to be called

    console.log('🧠 Smart wallet detection:', { hasSmartWallet, gaslessCount });
    return { hasSmartWallet, gaslessCount };
}

/**
 * Check if a specific transaction was gasless (sponsored)
 * Simplified: checks if gas price is 0 or very low
 */
export function isGaslessTransaction(tx: { gasPrice: string; gasUsed: string }): boolean {
    const gasPrice = BigInt(tx.gasPrice || '0');
    // Transactions with gas price of 0 are sponsored
    return gasPrice === BigInt(0);
}

/**
 * Count gasless transactions from transaction history
 */
export function countGaslessTransactions(
    transactions: { gasPrice: string; gasUsed: string }[]
): number {
    return transactions.filter(tx => isGaslessTransaction(tx)).length;
}
