// Types for Base Year Wrapped Feature - Full 18-Card Experience

export type Tribe =
    | 'DeFi Degen'
    | 'NFT Collector'
    | 'Yield Farmer'
    | 'Social Butterfly'
    | 'Builder'
    | 'OG'
    | 'Whale'
    | 'Explorer';

export interface TribeInfo {
    name: Tribe;
    description: string;
    icon: string;
    color: string;
}

export interface WrappedData {
    // === WALLET FUNDAMENTALS ===
    firstEverTransaction: string | null;     // First TX date EVER on Base (any year)
    firstEverTxHash: string | null;          // Hash of first ever transaction
    first2025Transaction: string | null;     // First TX date in 2025
    first2025TxHash: string | null;          // Hash of first 2025 transaction
    totalTransactions: number;               // 2025 transactions
    totalTransactionsAllTime: number;        // All-time transactions
    totalGasSpentETH: number;
    totalGasSpentUSD: number;
    gasSavedVsL1USD: number;                 // Compare to Ethereum L1 costs
    avgGasPerTxUSD: number;                  // Average gas per transaction
    uniqueDaysActive: number;
    longestStreak: number;                   // Consecutive days
    currentStreak: number;                   // Current active streak
    mostActiveMonth: string;
    mostActiveDay: string;                   // Day of week
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

    // === DEFI ACTIVITY ===
    totalSwapVolumeUSD: number;
    uniqueProtocolsUsed: number;
    favoriteProtocol: string;
    favoriteTradingPair: string;
    biggestSingleSwapUSD: number;
    biggestSwapToken: string;
    biggestSwapHash: string | null;
    protocolBreakdown: { name: string; count: number; percentage: number }[];

    // === NFT & SOCIAL (FILTERED - mints only, no scams) ===
    nftsMinted: number;                      // Only legitimate mints
    nftsReceived: number;                    // Received (potential scams filtered out)
    totalNftActivity: number;                // Total NFT interactions
    favoriteCollection: string;
    nftCollections: string[];                // Collections minted from

    // === IDENTITY & ACHIEVEMENTS ===
    hasBasename: boolean;
    basenameName: string | null;
    isOG: boolean;                           // First TX before Aug 2023
    is2025OG: boolean;                       // Active in Jan 2025
    hasSmartWallet: boolean;                 // Uses smart wallet
    gaslessTransactions: number;             // Sponsored transactions

    // === FINANCIAL SUMMARY ===
    totalVolumeUSD: number;

    // === RANKINGS ===
    percentileRank: number;                  // Top X% of Base users

    // === ARCHETYPE ===
    tribe: Tribe;
    tribeInfo: TribeInfo;

    // === ACHIEVEMENTS/BADGES ===
    badges: {
        id: string;
        name: string;
        icon: string;
        description: string;
        earned: boolean;
    }[];

    // === FUN METRICS ===
    luckyTransaction: {                      // Lowest gas fee TX
        hash: string;
        gasUSD: number;
        date: string;
    } | null;
    busiestDay: {                            // Most transactions in a day
        date: string;
        count: number;
    } | null;
    mostExperimentalDay: {                   // Day with most unique contracts
        date: string;
        uniqueContracts: number;
    } | null;
    gasSavedEquivalent: string;              // "47 lattes" or "3 flights"
    gasSavedExplanation: string;             // Explanation of how calculated

    // === COMMERCE & PAYMENTS (USDC) ===
    usdcSentTotal: number;                   // Total USDC sent (non-DEX transfers)
    usdcReceivedTotal: number;               // Total USDC received
    uniquePaymentRecipients: number;         // Unique addresses paid
    largestPaymentUSD: number;               // Largest single payment

    // === FARCASTER SOCIAL ===
    farcasterTipsSent: number;               // Tips sent via Farcaster
    farcasterTipsReceived: number;           // Tips received
    farcasterFollowers: number;              // NEW: Farcaster follower count
    farcasterCasts: number;                  // NEW: Number of casts
    hasFarcaster: boolean;                   // NEW: Has Farcaster account
    hasPowerBadge: boolean;                  // NEW: Farcaster Power Badge holder

    // === BUILDER ===
    contractsDeployed: number;               // NEW: Number of contracts deployed

    // === YIELD FARMER ===
    defiInteractions: number;                // NEW: Count of lending/staking/LP interactions

    // === PROTOCOL DIVERSITY ===
    protocolDiversityIndex: number;          // (Unique Protocols / Total TXs) × 100

    // === META ===
    walletAddress: string;
    yearStart: Date;
    yearEnd: Date;
    dataFetchedAt: Date;
}

// Full 18-card sequence
export type WrappedCardType =
    | 'welcome'
    | 'birthday'
    | 'teaser'
    | 'transactions'
    | 'activity'
    | 'streak'
    | 'gas'
    | 'protocols'
    | 'defi'
    | 'biggestSwap'
    | 'nft'
    | 'smartWallet'
    | 'badges'
    | 'moments'
    | 'rank'
    | 'tribe'
    | 'comparison'
    | 'summary';

export interface WrappedCardProps {
    data: WrappedData;
    onNext: () => void;
    onPrev: () => void;
    currentIndex: number;
    totalCards: number;
}

// Known NFT marketplace contracts (for filtering scam NFTs)
export const KNOWN_NFT_MARKETPLACES: string[] = [
    '0x777777722d078c97c6ad07d9f36801e653e356ae', // Zora
    '0x1598f989d1e5a1ec37d7abdf51b2a32d4573ad98', // Highlight
    '0x0000000000000068f116a894984e2db1123eb395', // OpenSea
    '0x00000000000000adc04c56bf30ac9d3c0aaf14dc', // Seaport
    '0x2da56acb9ea78330f947bd57c54119debda7af71', // Base Paint
    '0x758f9f9f5812c7697ac5dd5eeb957c3e1e0691dd', // Party Protocol
];

// Protocol mapping for counting - Expanded with 50+ popular Base protocols
export const WRAPPED_PROTOCOL_NAMES: Record<string, string> = {
    // === DEXs ===
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap',      // Universal Router
    '0x2626664c2603336e57b271c5c0b26f421741e481': 'Uniswap',      // V3 Router
    '0x198ef79f1f515f02dfe9e3115ed9fc07183f02fc': 'Uniswap',      // V3 Router 2
    '0x6337b3caf9c5236c7f3d1694410776119edaf9fa': 'Uniswap',      // Permit2
    '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': 'Aerodrome',    // Router
    '0x420dd381b31aef6683db6b902084cb0ffece40da': 'Aerodrome',    // Voter
    '0x827922686190790b37229fd06084350e74485b72': 'BaseSwap',     // Router
    '0x19ceead7105607cd444f5ad10dd51356436095a1': 'Odos',         // Router V2
    '0x111111125421ca6dc452d289314280a0f8842a65': '1inch',        // Aggregation Router
    '0x1111111254eeb25477b68fb85ed929f73a960582': '1inch',        // V5 Router
    '0x6131b5fae19ea4f9d964eac0408e4408b66337b5': 'KyberSwap',    // Router
    '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': 'SushiSwap',    // Router
    '0xfb7b2c1f38e803bbf1d53e9f5e4e69e7b89f8fe5': 'Maverick',     // Router
    '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae': 'LI.FI',        // Diamond
    '0x0000000000001ff3684f28c67538d4d072c22734': 'Paraswap',     // Augustus

    // === Bridges ===
    '0x49048044d57e1c92a77f79988d21fa8faf74e97e': 'Base Bridge',  // Official Bridge
    '0x3154cf16ccdb4c6d922629664174b904d80f2c35': 'Base Bridge',  // L1 Standard Bridge
    '0xaf54be5b6eec24d6bfacf1cce4eaf680a8239398': 'Stargate',     // Router
    '0x45f1a95a4d3f3836523f5c83673c797f4d4d263b': 'Stargate',     // Bridge
    '0x52ee324c4e0f81ee8c66f79e68f903bcf89f8e38': 'Synapse',      // Bridge
    '0xf5e10380213880111522dd0efD3dbb45b9f62Bcc': 'Hop',          // Bridge
    '0xb8901acb165ed027e32754e0ffe830802919727f': 'Hop',          // ETH Bridge
    '0x3a23f943181408eac424116af7b7790c94cb97a5': 'Socket',       // Gateway
    '0xc30141b657f4216252dc59af2e7cdb9d8792e1b0': 'Socket',       // Registry
    '0x1a1ec25dc08e98e5e93f1104b5e5cdd298707d31': 'LayerZero',    // Endpoint
    '0xb0d502e938ed5f4df2e681fe6e419ff29631d62b': 'Across',       // Bridge

    // === NFT Platforms ===
    '0x777777722d078c97c6ad07d9f36801e653e356ae': 'Zora',         // Creator
    '0x04e2516a2c207e84a1839755675dfd8ef6302f0a': 'Zora',         // ERC1155
    '0x1598f989d1e5a1ec37d7abdf51b2a32d4573ad98': 'Highlight',
    '0x00000000000000adc04c56bf30ac9d3c0aaf14dc': 'OpenSea',      // Seaport 1.5
    '0x0000000000000068f116a894984e2db1123eb395': 'OpenSea',      // Seaport 1.6
    '0x6c3deff87c8540b04c15f8fd32e08dcf9eeea6b5': 'Reservoir',    // Router
    '0x2da56acb9ea78330f947bd57c54119debda7af71': 'Base Paint',
    '0x758f9f9f5812c7697ac5dd5eeb957c3e1e0691dd': 'Party Protocol',
    '0x000000006551c19487814612e58fe06813775758': 'ERC-6551',     // Registry

    // === Lending / DeFi ===
    '0xa238dd80c259a72e81d7e4664a9801593f98d1c5': 'Aave',         // Pool
    '0x18cd499e3d7ed42feba981ac9236a278e4cdc2ee': 'Aave',         // aToken
    '0x46e6b214b524310239732d51387075e0e70970bf': 'Compound',
    '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf': 'Compound',     // cToken
    '0x628ff693426583d9a7fb391e54366292f509d457': 'Moonwell',     // USDC Market
    '0x703843c3379b52f9ff486c9f5892218d2a065cc8': 'Moonwell',     // ETH Market
    '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb': 'Morpho',       // Blue
    '0xbb505c54d71e9e599cb8435b4f0ceec05fc71cbd': 'Extra Finance',
    '0x8f44fd754285aa80b5dcf789e9f69b7e5c4f21a4': 'Seamless',
    '0x5e1cac103f943cd84a1e92dade4145664ebf692a': 'Beefy',        // Vault

    // === Identity / Social ===
    '0x03c4738ee98ae44591e1a4a4f3cab6641d95dd9a': 'Basename',     // Registrar
    '0x4ccb0bb02fcaba27e82a56646e81d8c5bc4119a5': 'Basename',     // Registry
    '0x00000000fcce7f938e7ae6d3c335bd6a1a7c593d': 'Warpcast',     // ID Registry
    '0x00000000fc6c5f01fc30151999387bb99a9f489b': 'Warpcast',     // Key Registry

    // === Other Popular ===
    '0xca11bde05977b3631167028862be2a173976ca11': 'Multicall3',
    '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24': 'Gnosis Safe',  // Proxy Factory
    '0x29fcb43b46531bca003ddc8fcb67ffe91900c762': 'Safe',         // Multi Send
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',         // Token
    '0x4200000000000000000000000000000000000006': 'WETH',         // Wrapped ETH
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 'DAI',          // Token
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': 'cbETH',        // Coinbase ETH
    '0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c': 'rETH',         // Rocket Pool ETH
};


// Badge definitions
export const BADGE_DEFINITIONS = [
    { id: 'og', name: 'OG', icon: '👑', description: 'First transaction before August 2023' },
    { id: 'early2025', name: 'Early 2025', icon: '🌅', description: 'Active in January 2025' },
    { id: 'streak7', name: 'Week Warrior', icon: '🔥', description: '7+ day streak' },
    { id: 'streak30', name: 'Month Master', icon: '💪', description: '30+ day streak' },
    { id: 'defi', name: 'DeFi Explorer', icon: '📊', description: 'Used 3+ DeFi protocols' },
    { id: 'nftCreator', name: 'NFT Creator', icon: '🎨', description: 'Minted 5+ NFTs' },
    { id: 'gasEfficient', name: 'Gas Saver', icon: '⛽', description: 'Saved $100+ vs L1' },
    { id: 'whale', name: 'Whale', icon: '🐋', description: '$50k+ volume' },
    { id: 'basename', name: 'Named', icon: '📛', description: 'Has a Basename' },
    { id: 'diverse', name: 'Diversified', icon: '🌈', description: 'Used 5+ protocols' },
];

// Tribe definitions
export const TRIBE_INFO: Record<Tribe, TribeInfo> = {
    'DeFi Degen': {
        name: 'DeFi Degen',
        description: 'You live for the swap. DeFi protocols are your playground, and every day brings a new opportunity to trade.',
        icon: '🔥',
        color: '#FF6B35',
    },
    'NFT Collector': {
        name: 'NFT Collector',
        description: 'Your wallet is a digital gallery. You have an eye for art and you\'re building a collection that tells a story.',
        icon: '🖼️',
        color: '#9B59B6',
    },
    'Yield Farmer': {
        name: 'Yield Farmer',
        description: 'Patience is your superpower. You stake, you lend, and you let compound interest work its magic.',
        icon: '🌾',
        color: '#27AE60',
    },
    'Social Butterfly': {
        name: 'Social Butterfly',
        description: 'You\'re all about the community. From Farcaster to social tokens, you\'re connecting the onchain world.',
        icon: '🦋',
        color: '#3498DB',
    },
    'Builder': {
        name: 'Builder',
        description: 'You don\'t just use the ecosystem—you create it. Smart contracts and dApps are your canvas.',
        icon: '🛠️',
        color: '#F39C12',
    },
    'OG': {
        name: 'OG',
        description: 'You were here before most. Your wallet carries the history of Base\'s earliest days.',
        icon: '👑',
        color: '#FFD700',
    },
    'Whale': {
        name: 'Whale',
        description: 'When you move, the ecosystem notices. Your transactions make waves across the network.',
        icon: '🐋',
        color: '#0052FF',
    },
    'Explorer': {
        name: 'Explorer',
        description: 'Curious and adventurous, you\'ve touched every corner of the Base ecosystem. Discovery is your middle name.',
        icon: '🧭',
        color: '#00FFA3',
    },
};
