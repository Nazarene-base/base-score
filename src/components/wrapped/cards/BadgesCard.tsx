'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function BadgesCard({ data, onNext }: WrappedCardProps) {
    const earnedBadges = data.badges.filter(b => b.earned);
    const unearnedBadges = data.badges.filter(b => !b.earned);

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(180deg, #1A1A0A 0%, #0A1628 50%, #050A19 100%)' }}
        >
            {/* Sparkle effect */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-[#FFD700] rounded-full"
                    style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${10 + Math.random() * 30}%`,
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col px-6 py-8 overflow-y-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/30 mb-4">
                        <span className="text-xl">🏆</span>
                        <span className="text-sm text-[#FFD700]">Achievements</span>
                    </div>
                    <p className="text-white/50 text-sm">
                        You earned {earnedBadges.length} of {data.badges.length} badges
                    </p>
                </motion.div>

                {/* Earned badges */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {earnedBadges.map((badge, i) => (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.1, type: 'spring', bounce: 0.4 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FF6B35]/10 border border-[#FFD700]/30"
                        >
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <p className="text-white font-semibold text-sm">{badge.name}</p>
                            <p className="text-white/40 text-xs">{badge.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Unearned badges (locked) */}
                {unearnedBadges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-3 text-center">Next Goals</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {unearnedBadges.slice(0, 4).map((badge) => (
                                <div
                                    key={badge.id}
                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2"
                                >
                                    <span className="text-lg grayscale opacity-50">{badge.icon}</span>
                                    <span className="text-white/30 text-xs">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
