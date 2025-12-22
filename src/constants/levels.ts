export type LevelId = 'citizen' | 'explorer' | 'culture' | 'liquidity' | 'native';

export interface LevelRequirement {
    id: string;
    label: string;
    description: string;
    check: (stats: any) => boolean; // Will type this properly later with WalletStats
}

export interface Level {
    id: LevelId;
    title: string;
    badge: string; // Emoji or Icon name
    description: string;
    requirements: LevelRequirement[];
    reward: string;
}

export const LEVELS: Level[] = [
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
                check: (stats) => stats.uniqueProtocols > 0,
            },
            {
                id: 'hold_3',
                label: 'Hold 3+ Tokens',
                description: 'Diversify your portfolio',
                check: (stats) => false, // TODO: Implement token count check
            },
        ],
    },
    // ... more levels to come
];
