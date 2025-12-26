'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { WrappedCardProps } from '@/types/wrapped';

export function TeaserCard({ data, onNext }: WrappedCardProps) {
    const getMessage = () => {
        if (data.uniqueDaysActive >= 200) return "You practically lived onchain this year...";
        if (data.uniqueDaysActive >= 100) return "You were seriously committed...";
        if (data.uniqueDaysActive >= 50) return "You showed up consistently...";
        if (data.uniqueDaysActive >= 20) return "You explored the possibilities...";
        return "Every journey starts somewhere...";
    };

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col items-center justify-center px-8"
            style={{ background: 'linear-gradient(180deg, #050A19 0%, #0A1628 100%)' }}
        >
            {/* Animated pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border border-[#0052FF]/30"
                        initial={{ width: 100, height: 100, opacity: 0.6 }}
                        animate={{
                            width: [100 + i * 80, 300 + i * 80],
                            height: [100 + i * 80, 300 + i * 80],
                            opacity: [0.4, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: 'easeOut',
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white/60 text-lg mb-8"
                >
                    {getMessage()}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
                    className="mb-4"
                >
                    <span className="text-8xl font-bold bg-gradient-to-r from-[#0052FF] via-[#00C2FF] to-[#00FFA3] bg-clip-text text-transparent">
                        <CountUp end={data.uniqueDaysActive} duration={2} />
                    </span>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/50 text-xl"
                >
                    days onchain in 2025
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 inline-flex items-center gap-2 text-white/30 text-sm"
                >
                    <span>Let's see what you did</span>
                    <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        →
                    </motion.span>
                </motion.div>
            </div>
        </div>
    );
}
