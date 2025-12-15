// Landing Page - For sharing and collecting waitlist signups
'use client';

import { useState } from 'react';
import {
  ZapIcon,
  TrophyIcon,
  TargetIcon,
  ChartIcon,
  CheckIcon,
  ArrowUpIcon,
} from '@/components/Icons';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call - replace with actual waitlist API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-base-blue/20 via-base-blue/5 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-5 pt-20 pb-16 text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-base-blue to-base-blue-light mb-8 animate-glow">
            <ZapIcon className="w-10 h-10 text-white" />
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Know Your Base Score
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track your onchain activity, check your airdrop readiness, and see your real trading P&L — all in one place.
          </p>
          
          {/* Waitlist Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-4 bg-bg-secondary border border-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-base-blue transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-base-blue to-base-blue-light rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-base-blue/40 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-success/15 border border-success/30 rounded-xl text-success">
              <CheckIcon className="w-5 h-5" />
              <span className="font-semibold">You're on the list! We'll notify you at launch.</span>
            </div>
          )}
          
          <p className="mt-4 text-sm text-gray-500">
            🚀 Launching soon as a Base mini app
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            Everything you need to maximize your Base presence
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <TrophyIcon className="w-8 h-8" />,
                title: 'Base Score',
                description: 'See how you rank against other Base users. Track your activity score and percentile in real-time.',
              },
              {
                icon: <TargetIcon className="w-8 h-8" />,
                title: 'Airdrop Checklist',
                description: 'Complete your airdrop readiness checklist. Know exactly what actions to take to qualify.',
              },
              {
                icon: <ChartIcon className="w-8 h-8" />,
                title: 'P&L Tracking',
                description: 'Track your actual trading performance. See your win rate, best trades, and total P&L.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-bg-card rounded-2xl border border-border hover:border-base-blue/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-base-blue/15 flex items-center justify-center text-base-blue mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-5 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Connect Wallet', desc: 'One-click connect with any wallet' },
              { step: '2', title: 'Analyze Activity', desc: 'We scan your Base transactions' },
              { step: '3', title: 'Get Your Score', desc: 'See your rank and percentile' },
              { step: '4', title: 'Complete Tasks', desc: 'Follow the checklist to improve' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-base-blue text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">
            What We Track
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Comprehensive analysis of your Base activity across all major protocols
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Total Transactions',
              'Unique Protocols',
              'Trading Volume',
              'Account Age',
              'NFTs Minted',
              'DeFi Activity',
              'Bridge Usage',
              'Gas Spent',
            ].map((metric, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-bg-card rounded-xl border border-border"
              >
                <CheckIcon className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-sm">{metric}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocols Section */}
      <section className="py-16 px-5 bg-bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Tracks All Major Base Protocols
          </h2>
          <p className="text-gray-400 mb-10">
            Including Uniswap, Aerodrome, Aave, Compound, Zora, Base Bridge, and more
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {['Uniswap', 'Aerodrome', 'Aave', 'Compound', 'Zora', 'Base Bridge', 'OpenSea', 'Basename'].map(
              (protocol, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-bg-card border border-border rounded-full text-sm text-gray-300"
                >
                  {protocol}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to know your Base Score?
          </h2>
          <p className="text-gray-400 mb-8">
            Join the waitlist and be the first to know when we launch.
          </p>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-4 bg-bg-secondary border border-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-base-blue transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-base-blue to-base-blue-light rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-base-blue/40 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-success/15 border border-success/30 rounded-xl text-success">
              <CheckIcon className="w-5 h-5" />
              <span className="font-semibold">You're on the list!</span>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-base-blue to-base-blue-light flex items-center justify-center">
              <ZapIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Base Score</span>
          </div>
          
          <p className="text-sm text-gray-500">
            Built for the Base ecosystem
          </p>
          
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="https://warpcast.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              Farcaster
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
