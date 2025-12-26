'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { WrappedCardProps } from '@/types/wrapped';

export function StreakCard({ data, onNext }: WrappedCardProps) {
    const getMessage = () => {
        if (data.longestStreak >= 30) return "A whole month of consistency! That's legendary dedication.";
        if (data.longestStreak >= 14) return "Two weeks strong! You're building serious momentum.";
        if (data.longestStreak >= 7) return "A full week! You've proven you can show up.";
        if (data.longestStreak >= 3) return "Nice streak! The habit is forming.";
        return "Every streak starts with day one. Keep it going!";
    };

    const getStreakEmoji = () => {
        if (data.longestStreak >= 30) return '🏆';
        if (data.longestStreak >= 14) return '💪';
        if (data.longestStreak >= 7) return '🔥';
        return '✨';
    };

    // Generate flame animation
    const flames = [...Array(Math.min(data.longestStreak, 20))].map((_, i) => ({
        delay: i * 0.1,
        size: 20 + Math.random() * 20,
        x: 50 + (Math.random() - 0.5) * 100,
        duration: 1 + Math.random(),
    }));

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col items-center justify-center px-6"
            style={{ background: 'linear-gradient(180deg, #1A0A0A 0%, #0A1628 50%, #050A19 100%)' }}
        >
            {/* Flame particles */}
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
                {flames.map((flame, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: flame.size,
                            height: flame.size,
                            background: 'radial-gradient(circle, #FF6B35 0%, #FF4500 50%, transparent 100%)',
                            left: flame.x - flame.size / 2,
                        }}
                        initial={{ y: 0, opacity: 0, scale: 0 }}
                        animate={{
                            y: [-20, -100],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.3],
                        }}
                        transition={{
                            duration: flame.duration,
                            repeat: Infinity,
                            delay: flame.delay,
                            ease: 'easeOut',
                        }}
                    />
                ))}
            </div>

            {/* Glow effect */}
            <motion.div
                className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#FF6B35] blur-[80px] opacity-30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Content */}
            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <span className="text-6xl">{getStreakEmoji()}</span>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/40 text-xs uppercase tracking-wider mb-2"
                >
                    Longest Streak
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
                    className="flex items-baseline justify-center gap-2 mb-2"
                >
                    <span className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FFD700]">
                        <CountUp end={data.longestStreak} duration={1.5} />
                    </span>
                    <span className="text-2xl text-white/60">days</span>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed"
                >
                    {getMessage()}
                </motion.p>

                {/* Current streak */}
                {data.currentStreak > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FFA3]/20 border border-[#00FFA3]/30"
                    >
                        <span className="text-[#00FFA3]">🔥</span>
                        <span className="text-sm text-[#00FFA3]">
                            Current streak: <strong>{data.currentStreak}</strong> days
                        </span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
