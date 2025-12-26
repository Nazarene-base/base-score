'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { WrappedCardProps } from '@/types/wrapped';

export function RankCard({ data, onNext }: WrappedCardProps) {
    const getMessage = () => {
        if (data.percentileRank >= 95) return "You're in the elite! Top tier Base user.";
        if (data.percentileRank >= 80) return "Impressive! You're way above average.";
        if (data.percentileRank >= 50) return "Solid performance! You're ahead of most.";
        if (data.percentileRank >= 20) return "Getting there! Keep building on Base.";
        return "Just getting started. The best is yet to come!";
    };

    const getEmoji = () => {
        if (data.percentileRank >= 95) return '🏆';
        if (data.percentileRank >= 80) return '🥇';
        if (data.percentileRank >= 50) return '🥈';
        return '🥉';
    };

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col items-center justify-center px-6"
            style={{ background: 'linear-gradient(180deg, #0A0A1A 0%, #0A1628 50%, #050A19 100%)' }}
        >
            {/* Radial chart background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg className="w-80 h-80" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#0052FF"
                        strokeWidth="2"
                        strokeDasharray="283"
                        strokeDashoffset={283 * (1 - data.percentileRank / 100)}
                        transform="rotate(-90 50 50)"
                    />
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="text-6xl mb-4"
                >
                    {getEmoji()}
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/40 text-xs uppercase tracking-wider mb-2"
                >
                    Among Base Users
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="flex items-baseline justify-center gap-1 mb-2"
                >
                    <span className="text-white/60 text-xl">Top</span>
                    <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0052FF] to-[#00FFA3]">
                        <CountUp end={100 - data.percentileRank} duration={1.5} />%
                    </span>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-white/50 text-sm max-w-xs mx-auto"
                >
                    {getMessage()}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-white/30 text-xs"
                >
                    Based on transaction activity vs. other Base wallets
                </motion.div>
            </div>
        </div>
    );
}
