# Base Score

Track your Base activity, check airdrop readiness, and see your real trading P&L.

## Features

- **Base Score**: See how you rank against other Base users
- **Airdrop Checklist**: Complete tasks to improve your airdrop readiness
- **P&L Tracking**: Track your actual trading performance on Base

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Wallet**: wagmi + viem
- **Data**: BaseScan API
- **Mini App**: Farcaster Frame SDK + MiniKit

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- BaseScan API key (free at https://basescan.org/apis)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/base-score.git
cd base-score
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your BaseScan API key:
```
NEXT_PUBLIC_BASESCAN_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx         # Main app (dashboard)
│   ├── landing/         # Landing page for waitlist
│   ├── api/             # API routes
│   └── .well-known/     # Farcaster manifest
├── components/          # React components
│   ├── ConnectScreen.tsx
│   ├── Dashboard.tsx
│   ├── BaseScoreTab.tsx
│   ├── PnLTab.tsx
│   └── ...
├── hooks/               # Custom React hooks
│   └── useWalletData.ts
├── lib/                 # Utilities and configs
│   ├── basescan.ts      # BaseScan API client
│   ├── wagmi.ts         # Wallet configuration
│   └── minikit-config.ts
└── types/               # TypeScript types
    └── index.ts
```

## Deployment to Vercel

1. Push your code to GitHub

2. Connect to Vercel:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard

3. Deploy!

## Configuring as a Base Mini App

After deploying to Vercel:

1. Update `NEXT_PUBLIC_URL` in your environment variables to your Vercel URL

2. Generate account association:
   - Go to https://www.base.dev/preview?tab=account
   - Follow the instructions to sign the manifest
   - Update `src/lib/minikit-config.ts` with your account association

3. Test your mini app:
   - Go to https://www.base.dev/preview
   - Enter your URL to preview

4. Submit for review:
   - Post your mini app to Base app or Farcaster
   - Users can discover and add it

## API Endpoints

### GET /.well-known/farcaster.json
Returns the Farcaster manifest for mini app discovery.

### POST /api/webhook
Receives webhooks from the Base/Farcaster platform.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_URL` | Your deployed app URL |
| `NEXT_PUBLIC_BASESCAN_API_KEY` | BaseScan API key |
| `NEXT_PUBLIC_PROJECT_NAME` | App name (optional) |

## Pages

- `/` - Main app (requires wallet connection)
- `/landing` - Marketing landing page with waitlist

## License

MIT
