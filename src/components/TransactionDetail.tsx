'use client';

import { useRef, useEffect } from 'react';

interface TransactionDetailProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: any[];
    totalCount: number;
}

export function TransactionDetail({ isOpen, onClose, transactions, totalCount }: TransactionDetailProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Calculate periods
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const count7d = transactions.filter(tx => new Date(Number(tx.timeStamp) * 1000) > oneWeekAgo).length;
    const count30d = transactions.filter(tx => new Date(Number(tx.timeStamp) * 1000) > oneMonthAgo).length;
    const count1y = transactions.filter(tx => new Date(Number(tx.timeStamp) * 1000) > oneYearAgo).length;

    const displayTotal = totalCount;

    const stats = [
        { label: 'Last 7 Days', value: count7d, color: 'text-white' },
        { label: 'Last 30 Days', value: count30d, color: 'text-white' },
        { label: 'Last Year', value: count1y, color: 'text-white' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div
                ref={modalRef}
                className="w-full max-w-sm glass-card rounded-3xl p-6 shadow-2xl space-y-6 animate-slide-up"
            >
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h3 className="font-space-grotesk font-bold text-xl text-white">Transaction History</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
                    >
                        ✕
                    </button>
                </div>

                {/* Stats List */}
                <div className="space-y-3">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="flex justify-between items-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-fade-in"
                            style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                        >
                            <span className="text-sm text-gray-400">{stat.label}</span>
                            <span className={`font-jetbrains-mono font-bold text-lg ${stat.color}`}>
                                {stat.value.toLocaleString()}
                            </span>
                        </div>
                    ))}

                    {/* Total - Highlighted */}
                    <div
                        className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 border border-accent-purple/20 animate-fade-in"
                        style={{ animationDelay: '0.4s' }}
                    >
                        <span className="text-sm text-white font-semibold">All Time</span>
                        <span className="font-jetbrains-mono font-bold text-2xl gradient-text">
                            {displayTotal.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-[10px] text-gray-500 text-center font-jetbrains-mono">
                    Based on on-chain data • {transactions.length < totalCount ? 'Partial history loaded' : 'Full history'}
                </p>
            </div>
        </div>
    );
}
