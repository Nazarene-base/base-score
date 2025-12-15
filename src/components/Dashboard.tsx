// Dashboard - Main app interface after wallet connection
'use client';

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletData } from '@/hooks/useWalletData';
import { BaseScoreTab } from './BaseScoreTab';
import { PnLTab } from './PnLTab';
import { ZapIcon, TrophyIcon, ChartIcon, WalletIcon, RefreshIcon } from './Icons';

type TabId = 'score' | 'pnl';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('score');
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    isLoading,
    error,
    stats,
    checklist,
    baseScore,
    percentile,
    recentTrades,
    pnl,
    refetch,
  } = useWalletData();

  // Format address for display
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
        <div className="w-12 h-12 border-3 border-bg-tertiary border-t-base-blue rounded-full animate-spin" />
        <p className="mt-4 text-gray-400">Loading your Base activity...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-5">
        <div className="text-danger text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-center mb-6">{error}</p>
        <button
          onClick={refetch}
          className="px-6 py-3 bg-base-blue rounded-xl text-white font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data state (new wallet)
  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-5">
        <div className="text-6xl mb-4">🆕</div>
        <h2 className="text-xl font-bold mb-2">Welcome to Base!</h2>
        <p className="text-gray-400 text-center mb-6">
          No activity found yet. Start using Base to build your score!
        </p>
        <a
          href="https://bridge.base.org"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-base-blue rounded-xl text-white font-semibold"
        >
          Bridge to Base
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-blue/5 via-bg-primary to-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-base-blue to-base-blue-light flex items-center justify-center">
            <ZapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">Base Score</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={refetch}
            className="p-2 rounded-lg bg-bg-secondary border border-border text-gray-400 hover:text-white transition-colors"
            title="Refresh data"
          >
            <RefreshIcon />
          </button>
          
          {/* Wallet button */}
          <button
            onClick={() => disconnect()}
            className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border rounded-xl text-gray-400 text-sm font-mono hover:text-white transition-colors"
          >
            <WalletIcon className="w-4 h-4" />
            {shortAddress}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 py-5 max-w-lg mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-bg-secondary rounded-xl mb-5">
          {[
            { id: 'score' as const, label: 'Base Score', icon: <TrophyIcon /> },
            { id: 'pnl' as const, label: 'P&L', icon: <ChartIcon /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-base-blue text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'score' ? (
          <BaseScoreTab
            baseScore={baseScore}
            percentile={percentile}
            stats={stats}
            checklist={checklist}
          />
        ) : pnl ? (
          <PnLTab pnl={pnl} recentTrades={recentTrades} />
        ) : (
          <div className="text-center py-10 text-gray-400">
            No trading data available
          </div>
        )}
      </main>
    </div>
  );
}
