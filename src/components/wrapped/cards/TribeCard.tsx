'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function TribeCard({ data, onNext }: WrappedCardProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Trigger confetti after animation
        const timer = setTimeout(() => setShowConfetti(true), 800);
        return () => clearTimeout(timer);
    }, []);

    // Create confetti effect using CSS
    const confettiColors = ['#0052FF', '#00C2FF', '#00FFA3', '#FFD700', '#FF6B35'];

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#050A19] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-8"
        >
            {/* Background with tribe color */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-[150px]"
                    style={{ backgroundColor: data.tribeInfo.color }}
                    animate={{
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                    }}
                />
            </div>

            {/* Confetti particles */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: confettiColors[i % confettiColors.length],
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                            }}
                            animate={{
                                y: ['0vh', '110vh'],
                                x: [0, (Math.random() - 0.5) * 100],
                                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                                opacity: [1, 1, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: Math.random() * 0.5,
                                ease: 'easeIn',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 text-center">
                {/* Label */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/50 text-sm uppercase tracking-wider mb-4"
                >
                    Your Base Tribe
                </motion.p>

                {/* Tribe icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: 0.4, bounce: 0.5 }}
                    className="text-8xl mb-4"
                >
                    {data.tribeInfo.icon}
                </motion.div>

                {/* Tribe name */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                    style={{ color: data.tribeInfo.color }}
                >
                    {data.tribe}
                </motion.h2>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-white/60 text-lg max-w-xs mx-auto leading-relaxed"
                >
                    {data.tribeInfo.description}
                </motion.p>

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                    style={{
                        backgroundColor: `${data.tribeInfo.color}15`,
                        borderColor: `${data.tribeInfo.color}40`,
                    }}
                >
                    <span className="text-xl">{data.tribeInfo.icon}</span>
                    <span style={{ color: data.tribeInfo.color }} className="font-medium">
                        {data.tribe} Badge Earned
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
