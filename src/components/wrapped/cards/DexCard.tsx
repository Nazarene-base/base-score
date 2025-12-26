'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function DexCard({ data, onNext }: WrappedCardProps) {
    const formatUSD = (usd: number) => {
        if (usd >= 1000000) {
            return `$${(usd / 1000000).toFixed(1)}M`;
        }
        if (usd >= 1000) {
            return `$${(usd / 1000).toFixed(1)}K`;
        }
        return `$${usd.toFixed(0)}`;
    };

    const getVolumeMessage = (volume: number) => {
        if (volume === 0) return "Ready to start trading?";
        if (volume < 1000) return "Dipping your toes in";
        if (volume < 10000) return "Getting comfortable";
        if (volume < 50000) return "Active trader!";
        if (volume < 100000) return "Power trader";
        if (volume < 500000) return "Whale alert! 🐋";
        return "Market mover! 👑";
    };

    const getTimeLabel = (time: typeof data.preferredTimeOfDay) => {
        const labels = {
            morning: '☀️ Morning trader',
            afternoon: '🌤️ Afternoon trader',
            evening: '🌆 Evening trader',
            night: '🌙 Night owl trader',
        };
        return labels[time];
    };

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#050A19] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-8"
        >
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#00C2FF] rounded-full opacity-15 blur-[120px]"
                    animate={{
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                {/* Icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-5xl mb-4"
                >
                    📊
                </motion.div>

                {/* Label */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/50 text-sm uppercase tracking-wider mb-6"
                >
                    DEX Trading Volume
                </motion.p>

                {/* Volume */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                >
                    <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#00FFA3] bg-clip-text text-transparent">
                        {formatUSD(data.totalSwapVolumeUSD)}
                    </span>
                </motion.div>

                {/* Message */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-[#00FFA3] font-medium text-lg mb-8"
                >
                    {getVolumeMessage(data.totalSwapVolumeUSD)}
                </motion.p>

                {/* Stats grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="grid grid-cols-2 gap-4"
                >
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl mb-2">🔄</div>
                        <div className="text-white/50 text-xs uppercase">Favorite Pair</div>
                        <div className="text-white font-medium">{data.favoriteTradingPair}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl mb-2">⏰</div>
                        <div className="text-white/50 text-xs uppercase">Trading Style</div>
                        <div className="text-white font-medium text-sm">{getTimeLabel(data.preferredTimeOfDay)}</div>
                    </div>
                </motion.div>

                {/* Streak info */}
                {data.longestStreak > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className="mt-6 text-white/40 text-sm"
                    >
                        🔥 Longest streak: {data.longestStreak} consecutive days
                    </motion.div>
                )}
            </div>
        </div>
    );
}
