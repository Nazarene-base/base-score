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

// Protocol mapping for counting
export const WRAPPED_PROTOCOL_NAMES: Record<string, string> = {
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap',
    '0x2626664c2603336e57b271c5c0b26f421741e481': 'Uniswap',
    '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': 'Aerodrome',
    '0xa238dd80c259a72e81d7e4664a9801593f98d1c5': 'Aave',
    '0x46e6b214b524310239732d51387075e0e70970bf': 'Compound',
    '0x49048044d57e1c92a77f79988d21fa8faf74e97e': 'Base Bridge',
    '0x777777722d078c97c6ad07d9f36801e653e356ae': 'Zora',
    '0x03c4738ee98ae44591e1a4a4f3cab6641d95dd9a': 'Basename',
    '0x1598f989d1e5a1ec37d7abdf51b2a32d4573ad98': 'Highlight',
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
