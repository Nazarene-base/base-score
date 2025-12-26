// Wallet configuration using wagmi and viem
// Fixed to handle Coinbase Wallet connection issues gracefully
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

// Get the app URL for wallet metadata
const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// WalletConnect project ID (optional but recommended for better UX)
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [base],
  connectors: [
    // Coinbase Wallet - primary for Base mini apps
    // Fixed: Added preference to avoid Smart Wallet connection issues on web
    coinbaseWallet({
      appName: 'Base Score',
      appLogoUrl: `${appUrl}/icon.png`,
      // Use 'all' to support both extension and mobile
      // 'smartWalletOnly' can cause "Communicator: failed to connect" on browsers
      preference: 'all',
    }),
    // Injected wallets (MetaMask, Rabby, etc.)
    injected({
      shimDisconnect: true, // Properly handle disconnect state
    }),
    // WalletConnect for mobile wallets (if project ID is configured)
    ...(walletConnectProjectId
      ? [
        walletConnect({
          projectId: walletConnectProjectId,
          metadata: {
            name: 'Base Score',
            description: 'Your Base Network Reputation Score',
            url: appUrl,
            icons: [`${appUrl}/icon.png`],
          },
        }),
      ]
      : []),
  ],
  transports: {
    // M-4 FIX: RPC fallback - if Alchemy fails, use public Base RPC
    [base.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
        : 'https://mainnet.base.org'
    ),
  },
  ssr: true,
});

// Type declaration for wagmi
declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
