'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function BirthdayCard({ data, onNext }: WrappedCardProps) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const firstEverDate = formatDate(data.firstEverTransaction);
    const first2025Date = formatDate(data.first2025Transaction);

    const getDaysOnBase = () => {
        if (!data.firstEverTransaction) return 0;
        const firstDate = new Date(data.firstEverTransaction);
        const now = new Date();
        return Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    const daysOnBase = getDaysOnBase();

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0F1A2E 50%, #050A19 100%)' }}
        >
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#0052FF]/20"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#00FFA3]/10"
                    animate={{
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/30 mb-4">
                        <span className="text-xl">🎂</span>
                        <span className="text-sm text-[#FFD700]">Your Base Story</span>
                    </div>
                </motion.div>

                {/* First ever TX */}
                {firstEverDate && (
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="mb-6"
                    >
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Your First Step on Base</p>
                        <p className="text-2xl font-bold text-white mb-1">{firstEverDate}</p>
                        <p className="text-white/50 text-sm">
                            That's <span className="text-[#0052FF] font-semibold">{daysOnBase.toLocaleString()}</span> days ago
                        </p>
                        {data.isOG && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring', bounce: 0.5 }}
                                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD700]/20 to-[#FF6B35]/20 border border-[#FFD700]/30"
                            >
                                <span className="text-sm">👑</span>
                                <span className="text-xs font-medium text-[#FFD700]">Base OG</span>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 }}
                    className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"
                />

                {/* First 2025 TX */}
                {first2025Date && (
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, type: 'spring' }}
                    >
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Your 2025 Journey Began</p>
                        <p className="text-2xl font-bold text-[#00FFA3] mb-1">{first2025Date}</p>
                        <p className="text-white/50 text-sm">
                            You were part of {data.is2025OG ? 'the very first wave of' : 'the amazing community of'} 2025 builders
                        </p>
                    </motion.div>
                )}

                {/* No 2025 activity message */}
                {!first2025Date && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center mt-4"
                    >
                        <p className="text-white/40">No 2025 activity yet</p>
                        <p className="text-white/30 text-sm">Let's change that! 🚀</p>
                    </motion.div>
                )}

                {/* Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-white/50 text-sm text-center italic"
                >
                    "Every great journey begins with a single transaction."
                </motion.p>
            </div>
        </div>
    );
}
