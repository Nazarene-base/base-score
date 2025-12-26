// Connect Screen - Landing page before wallet connection
// Fixed to handle connection errors gracefully
'use client';

import { useState } from 'react';
import { useConnect } from 'wagmi';
import { ZapIcon, TrophyIcon, TargetIcon, ChartIcon, WalletIcon } from './Icons';

export function ConnectScreen() {
  const { connect, connectors, isPending } = useConnect();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);

    // Try connectors in order of priority
    const coinbaseConnector = connectors.find((c) => c.id === 'coinbaseWalletSDK');
    const injectedConnector = connectors.find((c) => c.id === 'injected');
    const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect');

    const connectorToUse = coinbaseConnector || injectedConnector || walletConnectConnector;

    if (!connectorToUse) {
      setError('No wallet found. Please install a wallet extension.');
      return;
    }

    try {
      await connect(
        { connector: connectorToUse },
        {
          onError: (err) => {
            console.error('Connection error:', err);

            // Handle specific Coinbase Smart Wallet error
            if (err.message?.includes('Communicator: failed to connect')) {
              setError('Connection failed. Try using the Coinbase Wallet app or another wallet.');
            } else if (err.message?.includes('User rejected')) {
              setError('Connection cancelled. Please try again.');
            } else {
              setError('Failed to connect. Please try again or use a different wallet.');
            }
          },
        }
      );
    } catch (err: any) {
      console.error('Connect error:', err);

      // Handle specific errors
      if (err?.message?.includes('Communicator: failed to connect')) {
        setError('Coinbase Smart Wallet connection issue. Try using the Coinbase Wallet app instead.');
      } else {
        setError('Connection failed. Please try again.');
      }
    }
  };

  const handleTryInjected = () => {
    setError(null);
    const injectedConnector = connectors.find((c) => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else {
      setError('No browser wallet found. Try installing MetaMask or Coinbase Wallet extension.');
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

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-xs mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm text-center">{error}</p>
          <button
            onClick={handleTryInjected}
            className="w-full mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Try using browser wallet instead
          </button>
        </div>
      )}

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
        Works with Coinbase Wallet, MetaMask, and more
      </p>
    </div>
  );
}
