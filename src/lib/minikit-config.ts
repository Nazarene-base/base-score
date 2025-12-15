// MiniKit configuration for Base mini app
// This file configures the manifest and embed metadata

const ROOT_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export const minikitConfig = {
  // Account association will be added after deployment
  // Generate these at https://www.base.dev/preview?tab=account
  accountAssociation: {
    header: '',
    payload: '',
    signature: '',
  },
  
  // Mini app configuration
  miniapp: {
    version: '1',
    name: 'Base Score',
    subtitle: 'Track Your Base Activity & Airdrop Readiness',
    description:
      'Base Score tracks your onchain activity, shows your airdrop readiness checklist, and calculates your real trading P&L. See how you rank against other Base users.',
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: '#0A0B0D',
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    
    // Categories for discoverability
    primaryCategory: 'utility',
    tags: ['analytics', 'trading', 'airdrop', 'defi', 'portfolio'],
    
    // Screenshots for app store listing
    screenshotUrls: [
      `${ROOT_URL}/screenshots/score.png`,
      `${ROOT_URL}/screenshots/checklist.png`,
      `${ROOT_URL}/screenshots/pnl.png`,
    ],
    
    // Hero image for featured sections
    heroImageUrl: `${ROOT_URL}/hero.png`,
    
    // Open Graph metadata for embeds
    tagline: 'Know your Base Score',
    ogTitle: 'Base Score - Track Your Activity',
    ogDescription: 'See your Base activity score, airdrop checklist, and trading P&L',
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;

export type MiniKitConfig = typeof minikitConfig;
