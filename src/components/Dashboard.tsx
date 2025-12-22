import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletData } from '@/hooks/useWalletData';
import { BaseScoreTab } from './BaseScoreTab';
import { PnLTab } from './PnLTab';
import { CompareTab } from './CompareTab';
import { BootSequence } from './BootSequence';
import ScoreHero from './ScoreCard';
import { RefreshIcon } from './Icons';
import { BottomNav } from './BottomNav';

type TabId = 'score' | 'pnl' | 'compare' | 'profile';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('score');
  const [farcasterUser, setFarcasterUser] = useState<any>(null);
  const [showIntro, setShowIntro] = useState(true);
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
    lastFetched,
    transactions
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

  // Show Boot Sequence on first load
  if (showIntro) {
    return (
      <BootSequence
        isDataReady={!!stats && !isLoading}
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-primary text-white selection:bg-accent-purple/30 pb-[calc(100px+env(safe-area-inset-bottom))]">

      {/* === AMBIENT BACKGROUND EFFECTS === */}
      {/* Purple Glow - Top Left */}
      <div className="ambient-glow bg-accent-purple -top-40 -left-40" />
      {/* Pink Glow - Bottom Right */}
      <div className="ambient-glow bg-accent-pink -bottom-40 -right-40" style={{ animationDelay: '4s' }} />
      {/* Blue Glow - Center */}
      <div className="ambient-glow bg-base-blue top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />

      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />

      {/* === HEADER === */}
      <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center backdrop-blur-2xl border-b border-white/[0.03] bg-bg-primary/70">
        <div className="flex items-center gap-3">
          {/* Animated Status Dot */}
          <div className="relative w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-accent-purple animate-ping opacity-30" />
            <span className="relative block w-full h-full rounded-full bg-gradient-to-br from-accent-purple to-accent-pink shadow-[0_0_10px_rgba(123,97,255,0.6)]" />
          </div>
          <span className="font-space-grotesk font-bold tracking-tight text-sm">Base Score</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={refetch}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all active:scale-90"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => disconnect()}
            className="text-[10px] font-jetbrains-mono text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            {shortAddress} <span className="text-accent-purple ml-1">↗</span>
          </button>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="relative z-10 max-w-lg mx-auto px-5 py-6 space-y-6">

        {/* Error State */}
        {error && (
          <div className="glass-card p-4 border border-danger/30 rounded-xl text-danger text-sm font-jetbrains-mono flex items-center gap-3 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Farcaster Identity */}
        {farcasterUser && (
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="relative">
              <img
                src={farcasterUser.pfpUrl}
                className="w-12 h-12 rounded-full border-2 border-white/10 shadow-lg"
                alt="pfp"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bg-primary rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-success rounded-full border border-bg-primary animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-jetbrains-mono text-gray-500 uppercase tracking-[0.2em] mb-0.5">Connected</p>
              <h2 className="text-xl font-space-grotesk font-bold tracking-tight leading-none">@{farcasterUser.username}</h2>
            </div>
          </div>
        )}

        {/* Score Hero */}
        {activeTab === 'score' && (
          <ScoreHero score={baseScore} percentile={percentile} isLoading={isLoading} />
        )}

        {/* Tab Content */}
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
              transactions={transactions}
            />
          )}
          {activeTab === 'pnl' && (
            stats ? (
              <PnLTab pnl={pnl} recentTrades={recentTrades} />
            ) : (
              <div className="text-center text-gray-500 py-20 font-space-grotesk">Loading Market Data...</div>
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

        {/* Share Button */}
        <div className="pt-6 flex justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => {
              const shareText = encodeURIComponent(`My Base Score: ${baseScore}/100 🔵\n\nCheck your on-chain reputation on Base.`);
              const shareUrl = encodeURIComponent(`https://base-score-neon.vercel.app`);
              window.open(`https://warpcast.com/~/compose?text=${shareText}&embeds[]=${shareUrl}`, '_blank');
            }}
            className="group glass-card px-6 py-3 rounded-full border border-white/10 hover:border-accent-purple/30 transition-all duration-300 shine-effect"
          >
            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
              Share Your Score
            </span>
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        visible={!!stats || isLoading}
        onChange={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}