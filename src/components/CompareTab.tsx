'use client';

import { useState } from 'react';
import { useCompareWallet } from '@/hooks/useCompareWallet';
import { WalletStats } from '@/types';

interface CompareTabProps {
    myStats: WalletStats | null;
    myScore: number;
    myPercentile: number;
}

export function CompareTab({ myStats, myScore, myPercentile }: CompareTabProps) {
    const [searchInput, setSearchInput] = useState('');
    const {
        isLoading,
        error,
        stats: theirStats,
        score: theirScore,
        percentile: theirPercentile,
        resolvedName,
        resolvedAddress,
        fetch,
        clear
    } = useCompareWallet();

    const handleSearch = () => {
        if (searchInput.trim()) {
            fetch(searchInput.trim());
        }
    };

    const handleClear = () => {
        setSearchInput('');
        clear();
    };

    // Format helpers
    const formatNumber = (n: number) => n.toLocaleString();
    const formatAge = (date: Date | null) => {
        if (!date) return '0 days';
        const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (days < 30) return `${days}d`;
        if (days < 365) return `${Math.floor(days / 30)}mo`;
        return `${(days / 365).toFixed(1)}yr`;
    };
    const formatVolume = (v: number) => {
        if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
        return `$${v.toFixed(0)}`;
    };
    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Enter address, name.eth, or name.base.eth"
                    className="flex-1 px-4 py-3 bg-bg-secondary border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-jetbrains-mono focus:outline-none focus:border-base-blue transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading || !searchInput.trim()}
                    className="px-5 py-3 bg-base-blue rounded-xl text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-base-blue-bright transition-colors"
                >
                    {isLoading ? '...' : 'Compare'}
                </button>
            </div>

            {/* Resolved Name Info */}
            {resolvedName && resolvedAddress && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-400 text-sm">
                        ✓ Resolved <span className="font-bold">{resolvedName}</span>
                        <span className="text-gray-500 ml-2">({truncateAddress(resolvedAddress)})</span>
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Comparison Grid */}
            {(myStats || theirStats) && (
                <div className="grid grid-cols-2 gap-3">
                    {/* Header Row */}
                    <div className="bg-base-blue/10 rounded-xl p-4 text-center border border-base-blue/20">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">You</p>
                        <p className="text-2xl font-bold text-white">{myScore}</p>
                        <p className="text-xs text-gray-500">
                            {myPercentile >= 10 ? `Ahead of ${myPercentile}%` : 'Getting started'}
                        </p>
                    </div>
                    <div className={`rounded-xl p-4 text-center border ${theirStats ? 'bg-purple-500/10 border-purple-500/20' : 'bg-bg-secondary border-white/5'}`}>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                            {resolvedName || (theirStats ? 'Them' : 'Search to compare')}
                        </p>
                        <p className="text-2xl font-bold text-white">{theirStats ? theirScore : '—'}</p>
                        <p className="text-xs text-gray-500">
                            {theirStats ? (theirPercentile >= 10 ? `Ahead of ${theirPercentile}%` : 'Getting started') : ''}
                        </p>
                    </div>

                    {/* Stat Rows */}
                    {[
                        { label: 'Transactions', myVal: myStats?.totalTransactions || 0, theirVal: theirStats?.totalTransactions },
                        { label: 'Wallet Age', myVal: formatAge(myStats?.firstTxDate || null), theirVal: theirStats ? formatAge(theirStats.firstTxDate) : null, isString: true },
                        { label: 'Protocols', myVal: myStats?.uniqueProtocols || 0, theirVal: theirStats?.uniqueProtocols },
                        { label: 'Volume', myVal: formatVolume(myStats?.totalVolume || 0), theirVal: theirStats ? formatVolume(theirStats.totalVolume) : null, isString: true },
                        { label: 'NFTs', myVal: myStats?.nftsMinted || 0, theirVal: theirStats?.nftsMinted },
                    ].map((row) => (
                        <div key={row.label} className="contents">
                            <div className="bg-bg-secondary/50 rounded-lg p-3 flex justify-between items-center">
                                <span className="text-xs text-gray-500">{row.label}</span>
                                <span className="text-sm font-medium text-white">
                                    {row.isString ? row.myVal : formatNumber(row.myVal as number)}
                                </span>
                            </div>
                            <div className="bg-bg-secondary/50 rounded-lg p-3 flex justify-between items-center">
                                <span className="text-xs text-gray-500">{row.label}</span>
                                <span className="text-sm font-medium text-white">
                                    {row.theirVal !== null && row.theirVal !== undefined
                                        ? (row.isString ? row.theirVal : formatNumber(row.theirVal as number))
                                        : '—'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Clear Button */}
            {theirStats && (
                <button
                    onClick={handleClear}
                    className="w-full py-3 text-gray-500 text-sm hover:text-white transition-colors"
                >
                    Clear comparison
                </button>
            )}
        </div>
    );
}
