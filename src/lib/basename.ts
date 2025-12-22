import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Direct client for non-hook usage (e.g. in utility functions)
const publicClient = createPublicClient({
    chain: base,
    transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`)
});

const BASENAME_L2_RESOLVER = '0xC625350928430e6115329961e93DeC90f8E29762';

export async function getBasename(address: string): Promise<string | null> {
    try {
        const name = await publicClient.getEnsName({
            address: address as `0x${string}`,
            // Base uses a specific L2 resolver contract for .base.eth names often, 
            // but standard getEnsName might work if configured on-chain.
            // If standard lookup fails, we might need specific strict resolution.
            // For now, standard ENS resolution on Base chain usually resolves Basenames.
        });
        return name;
    } catch (error) {
        console.error('Error resolving Basename:', error);
        return null;
    }
}
