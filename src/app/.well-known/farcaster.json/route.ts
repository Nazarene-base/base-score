// Farcaster Manifest Route
import { NextResponse } from 'next/server';

const ROOT_URL = 'https://base-score-neon.vercel.app';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: '',
      payload: '',
      signature: '',
    },
    frame: {
      version: '1',
      name: 'Base Score',
      subtitle: 'Track Your Base Activity',
      description: 'Track your onchain activity, check airdrop readiness, and see your real trading P&L.',
      iconUrl: `${ROOT_URL}/icon.png`,
      splashImageUrl: `${ROOT_URL}/splash.png`,
      splashBackgroundColor: '#0A0B0D',
      homeUrl: ROOT_URL,
      webhookUrl: `${ROOT_URL}/api/webhook`,
      primaryCategory: 'finance',
      tags: ['analytics', 'trading', 'airdrop', 'defi', 'portfolio'],
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}