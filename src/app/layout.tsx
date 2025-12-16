// Root Layout - Wraps all pages with providers and global styles
import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/Providers';
import BaseReady from '@/components/BaseReady';
import './globals.css';

export const metadata: Metadata = {
  title: 'Base Score - Track Your Base Activity',
  description:
    'Track your Base activity, check airdrop readiness, and see your real trading P&L. Know where you rank among Base users.',
  openGraph: {
    title: 'Base Score',
    description: 'Track your Base activity and airdrop readiness',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base Score',
    description: 'Track your Base activity and airdrop readiness',
    images: ['/og-image.png'],
  },
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
        <Providers>{children}</Providers>
        <BaseReady />
      </body>
    </html>
  );
}