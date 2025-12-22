import type { WalletStats } from '@/types';

export type LevelId = 'citizen' | 'explorer' | 'culture' | 'liquidity' | 'native';

// L-6 FIX: Extracted thresholds for easier tuning
export const LEVEL_THRESHOLDS = {
    // Level 2
    MIN_TOKENS_HELD: 3,
    // Level 3
    MIN_PROTOCOLS_L3: 4,
    MIN_DAYS_ACTIVE: 7,
    // Level 4
    MIN_VOLUME_L4: 1000,
    MIN_TXS_L4: 50,
    // Level 5
    MIN_WALLET_AGE_MONTHS: 6,
    MIN_TXS_L5: 200,
    MIN_VOLUME_L5: 10000,
    MIN_PROTOCOLS_L5: 6,
} as const;

export interface LevelRequirement {
    id: string;
    label: string;
    description: string;
    check: (stats: WalletStats) => boolean;
}

export interface Level {
    id: LevelId;
    title: string;
    badge: string;
    description: string;
    requirements: LevelRequirement[];
    reward: string;
}

/**
 * Helper: Calculate wallet age in months from firstTxDate
 */
function getWalletAgeMonths(firstTxDate: Date | null): number {
    if (!firstTxDate) return 0;
    const now = new Date();
    const diffMs = now.getTime() - firstTxDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return Math.floor(diffDays / 30);
}

/**
 * LEVELS PROGRESSION SYSTEM
 * 
 * Level 1: Base Citizen - Establish presence
 * Level 2: DeFi Explorer - Discover DeFi
 * Level 3: Culture Creator - NFT engagement
 * Level 4: Liquidity Agent - Advanced DeFi
 * Level 5: Base Native - Power user status
 */
export const LEVELS: Level[] = [
    // ============================================
    // LEVEL 1: BASE CITIZEN
    // ============================================
    {
        id: 'citizen',
        title: 'Base Citizen',
        badge: '🛡️',
        description: 'Establish your presence on Base.',
        reward: 'Citizen Badge',
        requirements: [
            {
                id: 'bridge',
                label: 'Bridge to Base',
                description: 'Bridge ETH or tokens to Base Mainnet',
                check: (stats) => stats.ethBalance > 0 || stats.totalVolume > 0,
            },
            {
                id: 'first_tx',
                label: 'First Transaction',
                description: 'Complete your first on-chain transaction',
                check: (stats) => stats.totalTransactions > 0,
            },
            {
                id: 'basename',
                label: 'Claim Basename',
                description: 'Register a .base.eth name',
                check: (stats) => !!stats.basename,
            }
        ],
    },

    // ============================================
    // LEVEL 2: DEFI EXPLORER
    // ============================================
    {
        id: 'explorer',
        title: 'DeFi Explorer',
        badge: '🧭',
        description: 'Discover the DeFi ecosystem.',
        reward: 'Explorer Badge',
        requirements: [
            {
                id: 'swap',
                label: 'Execute a Swap',
                description: 'Swap tokens on Uniswap or Aerodrome',
                check: (stats) => stats.hasDexActivity,
            },
            {
                id: 'hold_3',
                label: 'Hold 3+ Tokens',
                description: 'Diversify your portfolio',
                check: (stats) => stats.tokenCount >= 3,
            },
        ],
    },

    // ============================================
    // LEVEL 3: CULTURE CREATOR
    // ============================================
    {
        id: 'culture',
        title: 'Culture Creator',
        badge: '🎨',
        description: 'Engage with the NFT ecosystem.',
        reward: 'Creator Badge',
        requirements: [
            {
                id: 'nft_mint',
                label: 'Mint an NFT',
                description: 'Mint or collect an NFT on Base',
                check: (stats) => stats.hasNftActivity || stats.nftsMinted > 0,
            },
            {
                id: 'protocols_4',
                label: 'Use 4+ Protocols',
                description: 'Interact with multiple dApps',
                check: (stats) => stats.uniqueProtocols >= 4,
            },
            {
                id: 'days_7',
                label: 'Active 7+ Days',
                description: 'Show consistent engagement',
                check: (stats) => stats.daysActive >= 7,
            },
        ],
    },

    // ============================================
    // LEVEL 4: LIQUIDITY AGENT
    // ============================================
    {
        id: 'liquidity',
        title: 'Liquidity Agent',
        badge: '💎',
        description: 'Master advanced DeFi protocols.',
        reward: 'Diamond Hands Badge',
        requirements: [
            {
                id: 'lending',
                label: 'Use Lending Protocol',
                description: 'Supply or borrow on Aave or Compound',
                check: (stats) => stats.hasLendingActivity,
            },
            {
                id: 'volume_1k',
                label: 'Trade $1,000+ Volume',
                description: 'Demonstrate significant trading activity',
                check: (stats) => stats.totalVolume >= 1000,
            },
            {
                id: 'tx_50',
                label: '50+ Transactions',
                description: 'High activity on-chain',
                check: (stats) => stats.totalTransactions >= 50,
            },
        ],
    },

    // ============================================
    // LEVEL 5: BASE NATIVE
    // ============================================
    {
        id: 'native',
        title: 'Base Native',
        badge: '🔵',
        description: 'Achieve power user status.',
        reward: 'OG Native Badge',
        requirements: [
            {
                id: 'age_6m',
                label: '6+ Months on Base',
                description: 'Long-term commitment to the ecosystem',
                check: (stats) => getWalletAgeMonths(stats.firstTxDate) >= 6,
            },
            {
                id: 'tx_200',
                label: '200+ Transactions',
                description: 'Extremely active on-chain presence',
                check: (stats) => stats.totalTransactions >= 200,
            },
            {
                id: 'volume_10k',
                label: '$10,000+ Volume',
                description: 'Major value contribution',
                check: (stats) => stats.totalVolume >= 10000,
            },
            {
                id: 'protocols_6',
                label: '6+ Protocols Used',
                description: 'Broad ecosystem engagement',
                check: (stats) => stats.uniqueProtocols >= 6,
            },
        ],
    },
];

/**
 * Get total number of requirements across all levels
 */
export function getTotalRequirements(): number {
    return LEVELS.reduce((sum, level) => sum + level.requirements.length, 0);
}

/**
 * Get number of completed requirements for a wallet
 */
export function getCompletedRequirements(stats: WalletStats): number {
    return LEVELS.reduce((sum, level) => {
        return sum + level.requirements.filter(req => req.check(stats)).length;
    }, 0);
}
