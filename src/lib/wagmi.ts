// Wallet configuration using wagmi and viem
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

// Get the app URL for wallet metadata
const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export const config = createConfig({
  chains: [base],
  connectors: [
    // Coinbase Wallet - primary for Base mini apps
    coinbaseWallet({
      appName: 'Base Score',
      appLogoUrl: `${appUrl}/icon.png`,
    }),
    // Injected wallets (MetaMask, Rabby, etc.)
    injected(),
  ],
  transports: {
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
  },
  ssr: true,
});

// Type declaration for wagmi
declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
