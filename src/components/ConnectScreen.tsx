// Connect Screen - Landing page before wallet connection
'use client';

import { useConnect } from 'wagmi';
import { ZapIcon, TrophyIcon, TargetIcon, ChartIcon, WalletIcon } from './Icons';

export function ConnectScreen() {
  const { connect, connectors, isPending } = useConnect();

  const handleConnect = () => {
    // Try Coinbase Wallet first, then injected
    const coinbaseConnector = connectors.find((c) => c.id === 'coinbaseWalletSDK');
    const injectedConnector = connectors.find((c) => c.id === 'injected');
    
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    } else if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-gradient-to-b from-base-blue/10 via-bg-primary to-bg-primary">
      {/* Logo */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-base-blue to-base-blue-light flex items-center justify-center mb-6 animate-glow">
        <ZapIcon className="w-10 h-10 text-white" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        Base Score
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-center max-w-xs mb-10 leading-relaxed">
        Track your Base activity, check airdrop readiness, and see your real trading P&L
      </p>

      {/* Features */}
      <div className="flex flex-col gap-4 mb-10 w-full max-w-xs">
        {[
          { icon: <TrophyIcon />, text: 'See your rank vs other Base users' },
          { icon: <TargetIcon />, text: 'Airdrop readiness checklist' },
          { icon: <ChartIcon />, text: 'Real P&L tracking' },
        ].map((feature, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl border border-border"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="text-base-blue">{feature.icon}</div>
            <span className="text-sm text-gray-400">{feature.text}</span>
          </div>
        ))}
      </div>

      {/* Connect Button */}
      <button
        onClick={handleConnect}
        disabled={isPending}
        className="flex items-center justify-center gap-2.5 w-full max-w-xs py-4 px-6 bg-gradient-to-r from-base-blue to-base-blue-light rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:shadow-base-blue/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <WalletIcon />
            Connect Wallet
          </>
        )}
      </button>

      <p className="mt-4 text-xs text-gray-500">
        Works with any Base-compatible wallet
      </p>
    </div>
  );
}
