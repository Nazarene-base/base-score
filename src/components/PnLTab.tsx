// P&L Tab - Shows trading performance and recent trades
'use client';

import { StatCard } from './StatCard';
import { ArrowUpIcon, ArrowDownIcon, ClockIcon } from './Icons';
import type { PnLData, Trade } from '@/types';

interface PnLTabProps {
  pnl: PnLData;
  recentTrades: Trade[];
}

export function PnLTab({ pnl, recentTrades }: PnLTabProps) {
  const isProfit = pnl.totalPnL >= 0;

  return (
    <div className="space-y-5">
      {/* P&L Header Card */}
      <div
        className="rounded-2xl p-6 border text-center animate-fade-in"
        style={{
          background: isProfit
            ? 'linear-gradient(135deg, rgba(0, 211, 149, 0.1) 0%, var(--bg-card) 100%)'
            : 'linear-gradient(135deg, rgba(255, 82, 82, 0.1) 0%, var(--bg-card) 100%)',
          borderColor: isProfit
            ? 'rgba(0, 211, 149, 0.3)'
            : 'rgba(255, 82, 82, 0.3)',
        }}
      >
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Total P&L
        </div>
        
        <div
          className={`text-4xl font-bold font-mono flex items-center justify-center gap-2 ${
            isProfit ? 'text-success' : 'text-danger'
          }`}
        >
          {isProfit ? <ArrowUpIcon className="w-6 h-6" /> : <ArrowDownIcon className="w-6 h-6" />}
          ${Math.abs(pnl.totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className={`text-base mt-1 ${isProfit ? 'text-success' : 'text-danger'}`}>
          {isProfit ? '+' : ''}{pnl.totalPnLPercent.toFixed(1)}%
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <StatCard
          label="Win Rate"
          value={`${pnl.winRate.toFixed(0)}%`}
          subValue={`${pnl.totalTrades} total trades`}
          color={pnl.winRate >= 50 ? 'success' : 'danger'}
        />
        <StatCard
          label="Last 7 Days"
          value={`${pnl.last7Days >= 0 ? '+' : ''}$${pnl.last7Days.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          color={pnl.last7Days >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          label="Best Trade"
          value={`+$${pnl.bestTrade.profit.toFixed(0)}`}
          subValue={`${pnl.bestTrade.token} (+${pnl.bestTrade.percent.toFixed(0)}%)`}
          color="success"
        />
        <StatCard
          label="Worst Trade"
          value={`$${pnl.worstTrade.loss.toFixed(0)}`}
          subValue={`${pnl.worstTrade.token} (${pnl.worstTrade.percent.toFixed(0)}%)`}
          color="danger"
        />
      </div>

      {/* Recent Trades */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-base font-semibold mb-4">Recent Trades</h3>
        
        <div className="space-y-2">
          {recentTrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No trades found
            </div>
          ) : (
            recentTrades.map((trade, index) => (
              <div
                key={trade.hash}
                className="flex items-center justify-between p-3.5 bg-bg-card rounded-xl border border-border animate-slide-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  {/* Trade type badge */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      trade.type === 'buy'
                        ? 'bg-success/15 text-success'
                        : 'bg-warning/15 text-warning'
                    }`}
                  >
                    {trade.type === 'buy' ? 'B' : 'S'}
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold">{trade.token}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {trade.timeAgo}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold font-mono ${
                      trade.pnl === null
                        ? 'text-gray-400'
                        : trade.pnl >= 0
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {trade.pnl === null
                      ? '—'
                      : `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {trade.amount.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upgrade CTA */}
      <div
        className="p-5 rounded-2xl border text-center animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 82, 255, 0.1) 0%, var(--bg-card) 100%)',
          borderColor: 'rgba(0, 82, 255, 0.3)',
          animationDelay: '0.3s',
        }}
      >
        <div className="text-sm font-semibold mb-2">
          Want full trade history & tax export?
        </div>
        <div className="text-xs text-gray-500 mb-4">
          Upgrade to Pro for $5/month
        </div>
        <button className="px-6 py-2.5 bg-base-blue rounded-lg text-white text-sm font-semibold hover:bg-base-blue-light transition-colors">
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}
