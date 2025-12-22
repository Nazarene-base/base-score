import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletData } from '@/hooks/useWalletData';
import { BaseScoreTab } from './BaseScoreTab';
import { PnLTab } from './PnLTab';
import { CompareTab } from './CompareTab';
import { BootSequence } from './BootSequence'; // NEW
import ScoreHero from './ScoreCard';
import { RefreshIcon } from './Icons';

import { BottomNav } from './BottomNav';

type TabId = 'score' | 'pnl' | 'compare' | 'profile';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('score');
  const [farcasterUser, setFarcasterUser] = useState<any>(null);
  const [showIntro, setShowIntro] = useState(true); // Control cinematic
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
    lastFetched
  } = useWalletData();

  // Farcaster Init
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

  // CINEMATIC: Show Boot Sequence until data is ready AND user watches it
  if (showIntro) {
    return (
      <BootSequence
        isDataReady={!!stats && !isLoading} // Tell intro when to finish
        onComplete={() => setShowIntro(false)} // Callback when animation ends
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-white selection:bg-base-blue pb-[calc(80px+env(safe-area-inset-bottom))]">
      {/* 2. Glassmorphism Header */}
      <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center backdrop-blur-xl border-b border-white/[0.03] bg-bg-primary/80">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-base-blue shadow-[0_0_10px_rgba(0,82,255,0.8)]" />
          <span className="font-space-grotesk font-bold tracking-tighter text-sm uppercase">Base Score</span>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={refetch} className="text-gray-500 hover:text-white transition-colors">
            <RefreshIcon className="w-4 h-4" />
          </button>
          <button onClick={() => disconnect()} className="text-[10px] font-jetbrains-mono text-gray-500 hover:text-white transition-colors">
            {shortAddress} [EXIT]
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-8 animate-fade-in">
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-jetbrains-mono flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* 3. Professional Identity Section */}
        {farcasterUser && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={farcasterUser.pfpUrl}
                className="w-12 h-12 rounded-full border border-white/10"
                alt="pfp"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bg-primary rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-bg-primary" />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-jetbrains-mono text-gray-500 uppercase tracking-[0.2em] mb-1">Authenticated</p>
              <h2 className="text-xl font-space-grotesk font-bold tracking-tight leading-none">@{farcasterUser.username}</h2>
            </div>
          </div>
        )}

        {/* 4. The Hero Component */}
        {activeTab === 'score' && (
          <div className="">
            <ScoreHero score={baseScore} percentile={percentile} isLoading={isLoading} />
          </div>
        )}

        {/* 6. Content Display (Dynamic) */}
        <div className="min-h-[300px]">
          {activeTab === 'score' && (
            <BaseScoreTab
              baseScore={baseScore}
              percentile={percentile}
              stats={stats || {
                totalTransactions: 0,
                uniqueProtocols: 0,
                totalVolume: 0,
                firstTxDate: null,
                daysActive: 0,
                gasSpent: 0,
                nftsMinted: 0,
                bridgeTransactions: 0,
                tokenCount: 0,
                hasDexActivity: false
              }}
              checklist={checklist}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'pnl' && (
            stats ? (
              <PnLTab pnl={pnl} recentTrades={recentTrades} />
            ) : (
              <div className="text-center text-white py-20 font-space-grotesk opacity-50">Loading Market Data...</div>
            )
          )}
          {activeTab === 'compare' && (
            <CompareTab
              myStats={stats}
              myScore={baseScore}
              myPercentile={percentile}
            />
          )}
        </div>

        {/* 7. Institutional-Grade Sharing */}
        <div className="pt-8 border-t border-white/[0.03] flex justify-center pb-8">
          <button
            onClick={() => {
              const shareText = encodeURIComponent(`Base Score: ${baseScore}/100 | Percentile: ${percentile}\n\nAnalyzing my on-chain footprint on @base.`);
              const shareUrl = encodeURIComponent(`https://base-score-neon.vercel.app`);
              window.open(`https://warpcast.com/~/compose?text=${shareText}&embeds[]=${shareUrl}`, '_blank');
            }}
            className="group flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
          >
            <span className="text-[10px] font-jetbrains-mono text-gray-400 group-hover:text-white transition-colors uppercase tracking-[0.3em]">
              Dispatch Report
            </span>
            <div className="h-[1px] w-12 bg-white/10 group-hover:w-24 group-hover:bg-base-blue transition-all duration-500" />
          </button>
        </div>
      </main>

      {/* NEW: Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        visible={!!stats || isLoading}
        onChange={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}