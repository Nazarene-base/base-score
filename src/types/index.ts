// Types for Base Score App

export interface WalletStats {
  totalTransactions: number;
  uniqueProtocols: number;
  totalVolume: number;
  firstTxDate: Date | null;
  daysActive: number;
  gasSpent: number;
  nftsMinted: number;
  bridgeTransactions: number;
}

export interface Trade {
  hash: string;
  token: string;
  tokenAddress: string;
  type: 'buy' | 'sell';
  amount: number;
  amountUSD: number;
  pnl: number | null;
  pnlPercent: number | null;
  timestamp: number;
  timeAgo: string;
}

export interface PnLData {
  totalPnL: number;
  totalPnLPercent: number;
  winRate: number;
  totalTrades: number;
  bestTrade: {
    token: string;
    profit: number;
    percent: number;
  };
  worstTrade: {
    token: string;
    loss: number;
    percent: number;
  };
  last7Days: number;
  last30Days: number;
}

export interface ChecklistItem {
  id: number;
  task: string;
  description: string;
  completed: boolean;
  link: string | null;
  points: number;
}

export interface BaseScoreData {
  address: string;
  baseScore: number;
  percentile: number;
  rank: number;
  totalUsers: number;
  stats: WalletStats;
  pnl: PnLData;
  checklist: ChecklistItem[];
  recentTrades: Trade[];
}

// BaseScan API Response Types
export interface BaseScanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  methodId: string;
  functionName: string;
}

export interface BaseScanTokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  value: string;
}

export interface BaseScanResponse<T> {
  status: string;
  message: string;
  result: T[];
}

// Protocol definitions for checklist
export interface Protocol {
  name: string;
  contracts: string[];
  category: 'dex' | 'lending' | 'nft' | 'bridge' | 'social' | 'other';
}

export const TRACKED_PROTOCOLS: Protocol[] = [
  {
    name: 'Uniswap',
    contracts: [
      '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', // Universal Router
      '0x2626664c2603336e57b271c5c0b26f421741e481', // SwapRouter02
    ],
    category: 'dex',
  },
  {
    name: 'Aerodrome',
    contracts: [
      '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43', // Router
    ],
    category: 'dex',
  },
  {
    name: 'Aave',
    contracts: [
      '0xa238dd80c259a72e81d7e4664a9801593f98d1c5', // Pool
    ],
    category: 'lending',
  },
  {
    name: 'Compound',
    contracts: [
      '0x46e6b214b524310239732d51387075e0e70970bf', // Comet USDC
    ],
    category: 'lending',
  },
  {
    name: 'Base Bridge',
    contracts: [
      '0x49048044d57e1c92a77f79988d21fa8faf74e97e', // L1 Standard Bridge
    ],
    category: 'bridge',
  },
  {
    name: 'Zora',
    contracts: [
      '0x777777722d078c97c6ad07d9f36801e653e356ae', // Zora Creator
    ],
    category: 'nft',
  },
  {
    name: 'Basename',
    contracts: [
      '0x03c4738ee98ae44591e1a4a4f3cab6641d95dd9a', // Base Names Registrar
    ],
    category: 'social',
  },
];


// Score breakdown interface for 3-pillar system
export interface ScoreBreakdown {
  total: number;
  citizen: {
    total: number;
    walletAge: number;
    transactionCount: number;
  };
  whale: {
    total: number;
    tradingVolume: number;
    ethBalance: number;
  };
  explorer: {
    total: number;
    protocolDiversity: number;
    identity: number;
  };
}
