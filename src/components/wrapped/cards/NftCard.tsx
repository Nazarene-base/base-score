'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function NftCard({ data, onNext }: WrappedCardProps) {
    const getMessage = () => {
        const total = data.nftsMinted + data.nftsReceived;
        if (total === 0) return "No NFT activity in 2025 yet. Maybe it's time to mint something special?";
        if (data.nftsMinted > 20) return "You're a prolific minter! Your collection tells quite a story.";
        if (data.nftsMinted > 5) return "Nice collection! You've been supporting creators on Base.";
        return "Every NFT has a story. What will you mint next?";
    };

    const total = data.nftsMinted + data.nftsReceived;

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(135deg, #1A0A20 0%, #0A1628 50%, #050A19 100%)' }}
        >
            {/* Floating gallery frames */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-16 h-16 border-2 border-[#9B59B6]/30 rounded-lg"
                    style={{
                        left: `${10 + i * 18}%`,
                        top: `${15 + Math.sin(i) * 10}%`,
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: [0.2, 0.4, 0.2],
                        y: [0, -10, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                    }}
                />
            ))}

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9B59B6]/20 border border-[#9B59B6]/30 mb-4">
                        <span className="text-xl">🖼️</span>
                        <span className="text-sm text-[#9B59B6]">NFT Collection</span>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center"
                    >
                        <span className="text-4xl font-bold text-[#00FFA3]">{data.nftsMinted}</span>
                        <p className="text-white/40 text-sm mt-1">Minted</p>
                        <p className="text-white/30 text-xs">(verified)</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center"
                    >
                        <span className="text-4xl font-bold text-[#9B59B6]">{data.nftsReceived}</span>
                        <p className="text-white/40 text-sm mt-1">Collected</p>
                        <p className="text-white/30 text-xs">(transfers)</p>
                    </motion.div>
                </div>

                {/* Favorite collection */}
                {data.favoriteCollection && data.favoriteCollection !== 'None' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-[#9B59B6]/20 to-transparent rounded-2xl p-5 mb-4 border border-[#9B59B6]/20"
                    >
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Favorite Collection</p>
                        <p className="text-[#9B59B6] font-bold text-lg">{data.favoriteCollection}</p>
                    </motion.div>
                )}

                {/* Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-white/50 text-sm text-center max-w-xs mx-auto"
                >
                    {getMessage()}
                </motion.p>

                {/* Note about filtering */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-white/20 text-xs text-center mt-4"
                >
                    * Only counting verified mints & transfers you initiated
                </motion.p>
            </div>
        </div>
    );
}
