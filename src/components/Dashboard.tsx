'use client';

import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletData } from '@/hooks/useWalletData';
import { BaseScoreTab } from './BaseScoreTab';
import { PnLTab } from './PnLTab';
import ScoreHero from './ScoreCard'; 
import { RefreshIcon } from './Icons';

type TabId = 'score' | 'pnl';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('score');
  const [farcasterUser, setFarcasterUser] = useState<any>(null);
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

  useEffect(() => {
    const init = async () => {
      const context = await sdk.context;
      if (context?.user) {
        setFarcasterUser(context.user);
      }
      await sdk.actions.ready();
    };
    init();
  }, []);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  // 1. High-End Technical Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary font-jetbrains-mono">
        <div className="w-48 h-[1px] bg-white/5 overflow-hidden relative mb-6">
          <div className="absolute inset-0 bg-base-blue animate-scan" />
        </div>
        <p className="text-[10px] text-gray-500 tracking-[0.4em] uppercase animate-pulse">
          Analyzing Base Mainnet
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-white selection:bg-base-blue">
      {/* 2. Glassmorphism Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-xl border-b border-white/[0.03] bg-bg-primary/80">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-base-blue shadow-[0_0_10px_rgba(0,82,255,0.8)]" />
          <span className="font-space-grotesk font-bold tracking-tighter text-sm uppercase">Base Score</span>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={refetch} className="text-gray-500 hover:text-white transition-colors">
            <RefreshIcon className="w-4 h-4" />
          </button>
          <button onClick={() => disconnect()} className="text-[10px] font-jetbrains-mono text-gray-500 hover:text-white transition-colors">
            {shortAddress} [DISCONNECT]
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10 pb-24">
        {/* 3. Professional Identity Section */}
        {farcasterUser && (
          <div className="flex items-center gap-4 mb-14 animate-fade-in">
            <div className="relative">
              <img 
                src={farcasterUser.pfpUrl} 
                className="w-12 h-12 rounded-full grayscale hover:grayscale-0 transition-all duration-1000 border border-white/10" 
                alt="pfp" 
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bg-primary rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-bg-primary" />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-jetbrains-mono text-gray-500 uppercase tracking-[0.2em]">Verified Operator</p>
              <h2 className="text-xl font-space-grotesk font-bold tracking-tight">@{farcasterUser.username}</h2>
            </div>
          </div>
        )}

        {/* 4. The Hero Component */}
        {activeTab === 'score' && (
          <div className="mb-14">
            <ScoreHero score={baseScore} />
          </div>
        )}

        {/* 5. Modern Minimalist Tab Navigation */}
        <nav className="flex gap-10 border-b border-white/[0.05] mb-12">
          {[
            { id: 'score' as const, label: 'Analytics' },
            { id: 'pnl' as const, label: 'Market P&L' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-[10px] font-jetbrains-mono uppercase tracking-[0.3em] transition-all relative ${
                activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-base-blue shadow-[0_0_8px_rgba(0,82,255,0.5)]" />
              )}
            </button>
          ))}
        </nav>

        {/* 6. Content Display */}
        <div className="animate-fade-in">
          {activeTab === 'score' ? (
            stats ? (
              <BaseScoreTab
                baseScore={baseScore}
                percentile={percentile}
                stats={stats}
                checklist={checklist}
              />
            ) : (
              <div className="text-center text-white py-20">Loading Base Score...</div>
            )
          ) : (
            stats ? (
              <PnLTab pnl={pnl} recentTrades={recentTrades} />
            ) : (
              <div className="text-center text-white py-20">Loading Market Data...</div>
            )
          )}
        </div>

        {/* 7. Institutional-Grade Sharing */}
        <div className="mt-16 pt-8 border-t border-white/[0.03] flex justify-center">
          <button 
            onClick={() => {
              const shareText = encodeURIComponent(`Base Score: ${baseScore} | Percentile: ${percentile}\n\nAnalyzing my on-chain footprint on @base.`);
              const shareUrl = encodeURIComponent(`https://base-score-neon.vercel.app`);
              window.open(`https://warpcast.com/~/compose?text=${shareText}&embeds[]=${shareUrl}`, '_blank');
            }}
            className="group flex flex-col items-center gap-3"
          >
            <span className="text-[10px] font-jetbrains-mono text-gray-500 group-hover:text-white transition-colors uppercase tracking-[0.3em]">
              Dispatch to Warpcast
            </span>
            <div className="h-[1px] w-12 bg-white/10 group-hover:w-24 group-hover:bg-base-blue transition-all duration-500" />
          </button>
        </div>
      </main>
    </div>
  );
}