'use client';

import React from 'react';
import { StatCard } from './StatCard';
import { ArrowUpIcon, ArrowDownIcon, ClockIcon } from './Icons';
import type { PnLData, Trade } from '@/types';

interface PnLTabProps {
  pnl: PnLData | null;
  recentTrades: Trade[];
}

export function PnLTab({ pnl, recentTrades }: PnLTabProps) {
  // Handle null pnl case
  if (!pnl) {
    return (
      <div className="text-center text-white py-20">
        Loading Market Data...
      </div>
    );
  }

  const isProfit = pnl.totalPnL >= 0;

  return (
    <div className="animate-fade-in space-y-10">
      {/* 1. Hero P&L Summary - Institutional Glass Style */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 backdrop-blur-3xl transition-all duration-700 hover:bg-white/[0.04]">
        {/* Professional ambient glow based on profit status */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] -z-10 opacity-20 ${isProfit ? 'bg-green-500' : 'bg-red-500'}`} />

        <div className="text-center">
          <p className="text-[10px] font-jetbrains-mono text-gray-500 uppercase tracking-[0.4em] mb-4">Realized Performance</p>
          <div className={`text-6xl font-space-grotesk font-bold tracking-tighter flex items-center justify-center gap-3 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? <ArrowUpIcon className="w-8 h-8" /> : <ArrowDownIcon className="w-8 h-8" />}
            ${Math.abs(pnl.totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className={`mt-2 font-jetbrains-mono text-sm ${isProfit ? 'text-green-500/80' : 'text-red-500/80'}`}>
            {isProfit ? 'PROFIT' : 'LOSS'} / {isProfit ? '+' : ''}{pnl.totalPnLPercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* 2. Stats Grid using your Professional StatCards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Win Rate"
          value={`${pnl.winRate.toFixed(0)}%`}
          subValue={`${pnl.totalTrades} total events`}
          color={pnl.winRate >= 50 ? 'success' : 'danger'}
        />
        <StatCard
          label="Last 7 Days"
          value={`${pnl.last7Days >= 0 ? '+' : ''}$${Math.abs(pnl.last7Days).toLocaleString()}`}
          color={pnl.last7Days >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          label="Alpha Trade"
          value={`+$${pnl.bestTrade.profit.toFixed(0)}`}
          subValue={`${pnl.bestTrade.token} entry`}
          color="success"
        />
        <StatCard
          label="Risk Event"
          value={`-$${Math.abs(pnl.worstTrade.loss).toFixed(0)}`}
          subValue={`${pnl.worstTrade.token} exit`}
          color="danger"
        />
      </div>

      {/* 3. Recent Trades - Minimalist Terminal Style */}
      <div className="pt-4">
        <h3 className="text-[10px] font-jetbrains-mono text-gray-500 uppercase tracking-[0.4em] mb-6 px-2">Terminal History</h3>
        <div className="space-y-3">
          {recentTrades.length === 0 ? (
            <div className="text-center py-12 rounded-[2rem] border border-dashed border-white/5 text-[10px] font-jetbrains-mono text-gray-600 uppercase">
              Waiting for on-chain events...
            </div>
          ) : (
            recentTrades.map((trade, index) => (
              <div
                key={trade.hash}
                className="group flex items-center justify-between p-5 glass rounded-3xl border border-white/5 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-bold border ${trade.type === 'buy' ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'}`}>
                    {trade.type === 'buy' ? 'B' : 'S'}
                  </div>
                  <div>
                    <div className="text-sm font-space-grotesk font-bold text-white tracking-tight">{trade.token}</div>
                    <div className="text-[10px] font-jetbrains-mono text-gray-600 flex items-center gap-1.5 mt-0.5">
                      <ClockIcon className="w-3 h-3 opacity-50" />
                      {trade.timeAgo}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-space-grotesk font-bold tracking-tight ${trade.pnl === null ? 'text-gray-500' : trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl === null ? '—' : `${trade.pnl >= 0 ? '+' : '-'}$${Math.abs(trade.pnl).toFixed(2)}`}
                  </div>
                  <div className="text-[10px] font-jetbrains-mono text-gray-600 mt-0.5 uppercase tracking-tighter">
                    {trade.amount.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Professional CTA */}
      <div className="mt-8 p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-base-blue/5 to-transparent text-center">
        <p className="text-xs font-space-grotesk font-semibold text-white mb-1">Institutional Reporting</p>
        <p className="text-[10px] font-jetbrains-mono text-gray-500 uppercase tracking-widest mb-6">Unlock Full History & Tax Exports</p>
        <button className="w-full py-4 glass rounded-2xl text-[10px] font-jetbrains-mono font-bold uppercase tracking-[0.2em] text-white hover:bg-base-blue/20 hover:border-base-blue/30 transition-all active:scale-95">
          Upgrade to Operator Pro
        </button>
      </div>
    </div>
  );
}