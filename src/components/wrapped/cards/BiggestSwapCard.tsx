'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { WrappedCardProps } from '@/types/wrapped';

export function BiggestSwapCard({ data, onNext }: WrappedCardProps) {
    const formatUSD = (usd: number) => {
        if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
        if (usd >= 10000) return `$${(usd / 1000).toFixed(1)}K`;
        if (usd >= 1000) return `$${(usd / 1000).toFixed(2)}K`;
        if (usd >= 1) return `$${usd.toFixed(2)}`;
        return `$${usd.toFixed(4)}`;
    };

    const getMessage = () => {
        if (data.totalVolumeUSD >= 100000) return "You moved serious capital this year. Whale status confirmed! 🐋";
        if (data.totalVolumeUSD >= 10000) return "Now that's real volume! You've been putting your assets to work.";
        if (data.totalVolumeUSD >= 1000) return "Solid activity! Every transaction tells a story in your journey.";
        if (data.totalVolumeUSD >= 100) return "You've been exploring the ecosystem. Nice start!";
        return "Every journey starts somewhere. Keep building on Base!";
    };

    const getBiggestTxMessage = () => {
        if (data.biggestSingleSwapUSD >= 10000) return "Your biggest single move was a whale-sized transaction!";
        if (data.biggestSingleSwapUSD >= 1000) return "This was your power move of the year.";
        if (data.biggestSingleSwapUSD >= 100) return "Your biggest transaction made an impact.";
        if (data.biggestSingleSwapUSD > 0) return "Your largest transaction this year.";
        return "No value transfers yet - explore the ecosystem!";
    };

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col items-center justify-center px-6"
            style={{ background: 'linear-gradient(180deg, #1A0A20 0%, #0A1628 50%, #050A19 100%)' }}
        >
            {/* Explosion effect */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-[#FFD700]"
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{
                            x: [0, Math.cos((i * 45) * Math.PI / 180) * 80],
                            y: [0, Math.sin((i * 45) * Math.PI / 180) * 80],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.3 + i * 0.1,
                            ease: 'easeOut',
                        }}
                    />
                ))}
            </div>

            {/* Glow */}
            <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#9B59B6] blur-[80px] opacity-20"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Content */}
            <div className="relative z-10 text-center w-full max-w-sm">
                {/* Total Volume Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <motion.p
                        className="text-white/40 text-xs uppercase tracking-wider mb-2"
                    >
                        Total Transaction Volume
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="mb-2"
                    >
                        <span className="text-5xl font-bold bg-gradient-to-r from-[#0052FF] via-[#00C2FF] to-[#00FFA3] bg-clip-text text-transparent">
                            <CountUp end={data.totalVolumeUSD} duration={1.5} prefix="$" separator="," decimals={0} />
                        </span>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/50 text-sm"
                    >
                        moved in {data.totalTransactions.toLocaleString()} transactions
                    </motion.p>
                </motion.div>

                {/* Divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 }}
                    className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"
                />

                {/* Biggest Transaction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/5 rounded-2xl p-5 border border-white/10"
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="text-3xl">💥</span>
                        <span className="text-white/40 text-xs uppercase tracking-wider">Biggest Transaction</span>
                    </div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FFD700] mb-2">
                        {formatUSD(data.biggestSingleSwapUSD)}
                    </div>
                    <p className="text-white/40 text-sm">
                        {getBiggestTxMessage()}
                    </p>
                </motion.div>

                {/* Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 text-white/40 text-sm max-w-xs mx-auto"
                >
                    {getMessage()}
                </motion.p>
            </div>
        </div>
    );
}
