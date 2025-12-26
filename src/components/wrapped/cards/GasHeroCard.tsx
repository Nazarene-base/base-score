'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { WrappedCardProps } from '@/types/wrapped';

export function GasHeroCard({ data, onNext }: WrappedCardProps) {
    const formatUSD = (usd: number) => {
        if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
        return `$${usd.toFixed(2)}`;
    };

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(180deg, #0A1628 0%, #051010 100%)' }}
        >
            {/* Animated gas pump glow */}
            <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full"
                style={{ background: 'radial-gradient(circle, #00FFA3 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FFA3]/20 border border-[#00FFA3]/30 mb-4">
                        <span className="text-xl">⛽</span>
                        <span className="text-sm text-[#00FFA3]">Gas Report</span>
                    </div>
                </motion.div>

                {/* Gas spent */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-6"
                >
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">You spent on gas</p>
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-white">
                            {formatUSD(data.totalGasSpentUSD)}
                        </span>
                    </div>
                    <p className="text-white/40 text-sm mt-1">
                        ({data.totalGasSpentETH.toFixed(4)} ETH)
                    </p>
                </motion.div>

                {/* Savings highlight */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="bg-gradient-to-r from-[#00FFA3]/20 to-[#0052FF]/20 rounded-2xl p-5 border border-[#00FFA3]/30 mb-4"
                >
                    <p className="text-white/60 text-sm mb-3">
                        {data.gasSavedExplanation}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-white/40 text-sm">You saved</span>
                        <span className="text-2xl font-bold text-[#00FFA3]">
                            <CountUp end={data.gasSavedVsL1USD} duration={1.5} prefix="$" decimals={0} />
                        </span>
                    </div>
                </motion.div>

                {/* Fun equivalent */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <p className="text-white/40 text-sm mb-2">That's like saving</p>
                    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-3xl">{data.gasSavedEquivalent.split(' ').pop()}</span>
                        <span className="text-xl font-bold text-white">{data.gasSavedEquivalent}</span>
                    </div>
                </motion.div>

                {/* Avg per tx */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-white/30 text-xs mt-6"
                >
                    Average: ${data.avgGasPerTxUSD.toFixed(4)} per transaction
                </motion.p>
            </div>
        </div>
    );
}
