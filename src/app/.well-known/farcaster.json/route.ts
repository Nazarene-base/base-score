// Farcaster Manifest Route
import { NextResponse } from 'next/server';

const ROOT_URL = 'https://base-score-neon.vercel.app';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: 'eyJmaWQiOjExODIyNDUsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg0OTg2NDU3NWI3NjZjNDM1YjIwN2E3NkQzOGEwYkUxQ0MzRmMwQTFjIn0',
      payload: 'eyJkb21haW4iOiJiYXNlLXNjb3JlLW5lb24udmVyY2VsLmFwcCJ9',
      signature: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMK5v_8xJ5DuK0wvBnHXljOWMJqn0vaTpc_Ukb48U5Vt8WZl7A_2YHLRIEAbwG2apCuarlD9pgwhUHX6yCL83lwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAl8ZgIay2xclZzG8RWZzuWvO8j9R0fus3XxDee9lRlVy8dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKeyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiWGFfaldRTzBjQ3ZPdkZFTlhBdW93ZlNyUXl3dnZvSGw0Z3lXM3ItUXgtOCIsIm9yaWdpbiI6Imh0dHBzOi8va2V5cy5jb2luYmFzZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    frame: {
      version: '1',
      name: 'Base Score',
      subtitle: 'Track Your Base Activity',
      description: 'Track your onchain activity, check airdrop readiness, and see your real trading P&L.',
      iconUrl: `${ROOT_URL}/icon.png`,
      imageUrl: `${ROOT_URL}/og-image.png`,
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