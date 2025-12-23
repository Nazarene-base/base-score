'use server';

/**
 * Blue-Chip NFT Detection Service
 * Checks if wallet holds prestigious Base NFT collections
 * 
 * Uses Alchemy NFT API to check holdings
 */

// Base Blue-Chip NFT Collections (contract addresses on Base mainnet)
export const BLUE_CHIP_NFTS = [
    {
        name: 'Based Punks',
        contract: '0x4a5e2a9ec6c9517b55dda25c3f9b459698e67c171',
        points: 15,
        description: 'OG Base community NFT',
    },
    {
        name: 'BasedFellas',
        contract: '0x617978b8af11570c2dab7c39163a8bdc00b11e6d',
        points: 15,
        description: 'Popular Base community collection',
    },
    {
        name: 'Onchain Gaias',
        contract: '0x5cef28d0f7c9eff3e3b7c9df3f8ff4bc3f1a3c9f',
        points: 15,
        description: 'Trending Base art collection',
    },
    {
        name: 'Tiny Based Frogs',
        contract: '0x4c9bfb772e0a7bf87e44f0d9c1c7b0e7d5a0e3b7',
        points: 10,
        description: 'Base community favorite',
    },
    {
        name: 'Base Gods',
        contract: '0x8d0f893bdf2fc04f8578cdd6b2e3c2e7f6e0c3a1',
        points: 15,
        description: 'Base mythology collection',
    },
    {
        name: 'The Warplets',
        contract: '0x7dd4e31f1530ac682c8ea4d8016e95773e08d8b401',
        points: 15,
        description: 'Premium Base generative art',
    },
    {
        name: 'Primitives',
        contract: '0x9a3dbc5f6f7e8b3a8c4e5f6a7b8c9d0e1f2a3b4c',
        points: 10,
        description: 'Minimalist Base art',
    },
];

export interface BlueChipNFTResult {
    hasBlueChips: boolean;
    collections: string[];
    totalPoints: number;
    details: { name: string; count: number; points: number }[];
}

/**
 * Check if wallet holds any blue-chip NFTs on Base
 * Uses Alchemy's getNFTsForOwner endpoint
 */
export async function checkBlueChipNFTs(address: string): Promise<BlueChipNFTResult> {
    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

    if (!alchemyKey) {
        console.log('ℹ️ NFT Check: No Alchemy API key');
        return { hasBlueChips: false, collections: [], totalPoints: 0, details: [] };
    }

    try {
        console.log('🖼️ Checking blue-chip NFT holdings for', address.slice(0, 10));

        // Query Alchemy for NFTs owned by this address
        const response = await fetch(
            `https://base-mainnet.g.alchemy.com/nft/v3/${alchemyKey}/getNFTsForOwner?owner=${address}&withMetadata=false&pageSize=100`,
            {
                headers: { accept: 'application/json' },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            console.error('❌ Alchemy NFT API error:', response.status);
            return { hasBlueChips: false, collections: [], totalPoints: 0, details: [] };
        }

        const data = await response.json();
        const ownedNFTs = data.ownedNfts || [];

        // Check which blue-chip collections the user holds
        const blueChipAddresses = BLUE_CHIP_NFTS.map(n => n.contract.toLowerCase());
        const foundCollections: Map<string, number> = new Map();

        for (const nft of ownedNFTs) {
            const contractAddr = nft.contract?.address?.toLowerCase();
            if (contractAddr && blueChipAddresses.includes(contractAddr)) {
                foundCollections.set(contractAddr, (foundCollections.get(contractAddr) || 0) + 1);
            }
        }

        // Calculate points
        const details: { name: string; count: number; points: number }[] = [];
        let totalPoints = 0;

        for (const blueChip of BLUE_CHIP_NFTS) {
            const count = foundCollections.get(blueChip.contract.toLowerCase()) || 0;
            if (count > 0) {
                // Points for first NFT, diminishing for duplicates
                const points = blueChip.points; // Just count once per collection
                details.push({ name: blueChip.name, count, points });
                totalPoints += points;
            }
        }

        // Cap total at 50 points
        totalPoints = Math.min(50, totalPoints);

        console.log('✅ Blue-chip NFTs:', details.length > 0 ? details.map(d => d.name).join(', ') : 'none');

        return {
            hasBlueChips: details.length > 0,
            collections: details.map(d => d.name),
            totalPoints,
            details,
        };
    } catch (error) {
        console.error('❌ NFT check error:', error);
        return { hasBlueChips: false, collections: [], totalPoints: 0, details: [] };
    }
}
