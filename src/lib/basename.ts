import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Direct client for non-hook usage (e.g. in utility functions)
const publicClient = createPublicClient({
    chain: base,
    transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`)
});

const BASENAME_L2_RESOLVER = '0xC625350928430e6115329961e93DeC90f8E29762';

// BUG-C4 FIX: Add timeout to prevent infinite hangs
const BASENAME_TIMEOUT_MS = 5000;

export async function getBasename(address: string): Promise<string | null> {
    try {
        // Create a timeout promise
        const timeoutPromise = new Promise<null>((_, reject) => {
            setTimeout(() => reject(new Error('Basename resolution timeout')), BASENAME_TIMEOUT_MS);
        });

        // Race between ENS lookup and timeout
        const namePromise = publicClient.getEnsName({
            address: address as `0x${string}`,
            // Base uses a specific L2 resolver contract for .base.eth names often, 
            // but standard getEnsName might work if configured on-chain.
            // If standard lookup fails, we might need specific strict resolution.
            // For now, standard ENS resolution on Base chain usually resolves Basenames.
        });

        const name = await Promise.race([namePromise, timeoutPromise]);
        return name;
    } catch (error) {
        // Silently handle timeout and other errors
        if (error instanceof Error && error.message === 'Basename resolution timeout') {
            console.warn('⚠️ Basename resolution timed out for:', address.slice(0, 10));
        } else {
            console.error('Error resolving Basename:', error);
        }
        return null;
    }
}
