'use client';

import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useAccount } from 'wagmi';
import { ConnectScreen } from '@/components/ConnectScreen';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  const { isConnected, isConnecting } = useAccount();

  useEffect(() => {
    const init = async () => {
      // This tells the Farcaster app to hide the loading splash screen
      // and show your actual website.
      await sdk.actions.ready();
    };

    init();
  }, []);

  // Show loading while checking connection
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        {/* Minimalist spinner that matches your Base Blue theme */}
        <div className="w-10 h-10 border-3 border-bg-tertiary border-t-base-blue rounded-full animate-spin" />
      </div>
    );
  }

  // Show connect screen or dashboard based on wallet state
  return isConnected ? <Dashboard /> : <ConnectScreen />;
}