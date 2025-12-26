'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function WelcomeCard({ data, onNext }: WrappedCardProps) {
    const shortAddress = `${data.walletAddress.slice(0, 6)}...${data.walletAddress.slice(-4)}`;

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#050A19] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-8"
        >
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#0052FF] rounded-full opacity-30 blur-[100px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00FFA3] rounded-full opacity-20 blur-[80px]"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 2,
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                {/* Year badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
                    <span className="text-sm font-medium text-[#00C2FF]">2025</span>
                </motion.div>

                {/* Main title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                >
                    <span className="bg-gradient-to-r from-white via-[#00C2FF] to-[#00FFA3] bg-clip-text text-transparent">
                        Your Year
                    </span>
                    <br />
                    <span className="text-white">on Base</span>
                </motion.h1>

                {/* Wallet address */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                >
                    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0052FF] to-[#00FFA3] flex items-center justify-center text-sm font-bold">
                            {data.basenameName?.charAt(0).toUpperCase() || '🔵'}
                        </div>
                        <div className="text-left">
                            {data.basenameName ? (
                                <>
                                    <div className="text-white font-medium">{data.basenameName}</div>
                                    <div className="text-white/40 text-xs font-mono">{shortAddress}</div>
                                </>
                            ) : (
                                <div className="text-white font-mono">{shortAddress}</div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Tap to continue */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-white/30 text-sm"
                >
                    Tap anywhere to continue →
                </motion.p>
            </div>
        </div>
    );
}
