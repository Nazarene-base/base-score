'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useAccount } from 'wagmi';
import { ConnectScreen } from '@/components/ConnectScreen';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  const { isConnected, isConnecting } = useAccount();
  const [farcasterUser, setFarcasterUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      // 1. Get the user's info from Farcaster
      const context = await sdk.context;
      if (context?.user) {
        setFarcasterUser(context.user);
      }

      // 2. Tell Farcaster we are ready to show the app
      await sdk.actions.ready();
    };

    init();
  }, []);

  // Show loading while checking connection
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-10 h-10 border-3 border-bg-tertiary border-t-base-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-white p-6">
      {/* Personalized Greeting for Farcaster Users */}
      {farcasterUser && (
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
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

      {/* Main Logic */}
      {isConnected ? <Dashboard /> : <ConnectScreen />}
    </div>
  );
}