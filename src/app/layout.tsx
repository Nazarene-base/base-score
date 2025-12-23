import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import BaseReady from '@/components/BaseReady';
import '@coinbase/onchainkit/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Base Score',
  description: 'Track your onchain activity, check airdrop readiness, and see your real trading P&L',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    title: 'Base Score',
    description: 'Track your onchain activity, check airdrop readiness, and see your real trading P&L',
    images: ['/og-image.png'],
  },
  // This is the Farcaster Frame v2 Metadata
  other: {
    'fc:frame': JSON.stringify({
      version: '1',
      imageUrl: 'https://base-score-neon.vercel.app/og-image.png',
      button: {
        title: 'Check Your Score',
        action: {
          type: 'launch_frame',
          name: 'Base Score',
          url: 'https://base-score-neon.vercel.app',
          splashImageUrl: 'https://base-score-neon.vercel.app/splash.png',
          splashBackgroundColor: '#040B0D'
        }
      }
    })
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0B0D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Necessary for Base SDK and branding */}
        <meta name="base:app_id" content="6940a615d77c069a945bdf3b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script src="https://basescan.org/scripts/base-sdk.js" async></script>
      </head>
      <body className="bg-bg-primary text-white antialiased">
        <Providers>
          {children}
        </Providers>
        <BaseReady />
      </body>
    </html>
  );
}