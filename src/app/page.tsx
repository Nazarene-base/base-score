// Main App Page - Entry point for the mini app
'use client';

import { useAccount } from 'wagmi';
import { ConnectScreen } from '@/components/ConnectScreen';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  const { isConnected, isConnecting } = useAccount();

  // Show loading while checking connection
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-10 h-10 border-3 border-bg-tertiary border-t-base-blue rounded-full animate-spin" />
      </div>
    );
  }

  // Show connect screen or dashboard based on wallet state
  return isConnected ? <Dashboard /> : <ConnectScreen />;
}
