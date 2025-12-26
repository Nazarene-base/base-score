'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function ComparisonCard({ data, onNext }: WrappedCardProps) {
    // Tribe distribution (simulated ecosystem data)
    const tribeDistribution: Record<string, number> = {
        'DeFi Degen': 25,
        'Explorer': 22,
        'NFT Collector': 18,
        'Whale': 8,
        'OG': 10,
        'Yield Farmer': 7,
        'Builder': 6,
        'Social Butterfly': 4,
    };

    const yourTribePercent = tribeDistribution[data.tribe] || 10;

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(180deg, #0A1628 0%, #050A19 100%)' }}
        >
            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-4">
                        <span className="text-xl">{data.tribeInfo.icon}</span>
                        <span className="text-sm text-white/70">Tribe Comparison</span>
                    </div>
                </motion.div>

                {/* Main stat */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <p className="text-white/60 text-lg mb-2">You're one of</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-5xl font-bold" style={{ color: data.tribeInfo.color }}>
                            {yourTribePercent}%
                        </span>
                    </div>
                    <p className="text-white/60 text-lg mt-2">
                        of Base users who are <span style={{ color: data.tribeInfo.color }}>{data.tribe}s</span>
                    </p>
                </motion.div>

                {/* Tribe bar chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                >
                    {Object.entries(tribeDistribution)
                        .sort(([, a], [, b]) => b - a)
                        .map(([tribe, percent], i) => (
                            <div key={tribe} className="flex items-center gap-3">
                                <span className="w-8 text-lg">{
                                    tribe === 'DeFi Degen' ? '🔥' :
                                        tribe === 'Explorer' ? '🧭' :
                                            tribe === 'NFT Collector' ? '🖼️' :
                                                tribe === 'Whale' ? '🐋' :
                                                    tribe === 'OG' ? '👑' :
                                                        tribe === 'Yield Farmer' ? '🌾' :
                                                            tribe === 'Builder' ? '🛠️' : '🦋'
                                }</span>
                                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{
                                            background: tribe === data.tribe
                                                ? `linear-gradient(90deg, ${data.tribeInfo.color}, ${data.tribeInfo.color}80)`
                                                : 'rgba(255,255,255,0.1)',
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                                    />
                                </div>
                                <span className={`text-xs w-8 text-right ${tribe === data.tribe ? 'text-white font-bold' : 'text-white/40'}`}>
                                    {percent}%
                                </span>
                            </div>
                        ))}
                </motion.div>
            </div>
        </div>
    );
}
