'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useAccount } from 'wagmi';
import { ConnectScreen } from '@/components/ConnectScreen';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  const { address, isConnected, isConnecting } = useAccount();
  const [farcasterUser, setFarcasterUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      // 1. Get the user's info from Farcaster
      const context = await sdk.context;
      if (context?.user) {
        setFarcasterUser(context.user);
        console.log('🎭 Farcaster User:', context.user.username);
        // Log full context for debugging (type-safe)
        console.log('🔗 Farcaster Context:', JSON.stringify(context.user, null, 2));
      }

      // 2. Tell Farcaster we are ready to show the app
      await sdk.actions.ready();
    };

    init();
  }, []);

  // DEBUG: Log connection state
  useEffect(() => {
    console.log('🔌 Wallet Connection State:', {
      isConnected,
      isConnecting,
      address: address || 'NO ADDRESS',
      hasValidAddress: !!address && address.startsWith('0x')
    });
  }, [isConnected, isConnecting, address]);

  // Show loading while checking connection
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-10 h-10 border-3 border-bg-tertiary border-t-base-blue rounded-full animate-spin" />
      </div>
    );
  }

  // IMPORTANT: Only show Dashboard if we have BOTH connection AND valid address
  const hasValidConnection = isConnected && address && address.startsWith('0x');

  return (
    <div className="min-h-screen bg-bg-primary text-white">
      {/* Personalized Greeting for Farcaster Users (only on Connect screen) */}
      {!hasValidConnection && farcasterUser && (
        <div className="flex items-center gap-3 p-6 animate-fade-in">
          {farcasterUser.pfpUrl && (
            <img
              src={farcasterUser.pfpUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-white/10 shadow-sm"
            />
          )}
          <div>
            <p className="text-xs text-gray-400 font-jetbrains-mono uppercase tracking-widest">Farcaster User</p>
            <h2 className="text-lg font-space-grotesk font-bold">
              Welcome, {farcasterUser.displayName || farcasterUser.username}
            </h2>
          </div>
        </div>
      )}

      {/* Main Logic - REQUIRE valid address */}
      {hasValidConnection ? <Dashboard /> : <ConnectScreen />}
    </div>
  );
}