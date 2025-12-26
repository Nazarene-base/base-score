'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function TransactionsCard({ data, onNext }: WrappedCardProps) {
    const [count, setCount] = useState(0);
    const targetCount = data.totalTransactions;

    // Animated counter
    useEffect(() => {
        if (targetCount === 0) return;

        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = targetCount / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetCount) {
                setCount(targetCount);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [targetCount]);

    const getTxMessage = (count: number) => {
        if (count === 0) return "Ready to start your journey?";
        if (count < 10) return "Just getting started!";
        if (count < 50) return "Building momentum!";
        if (count < 100) return "You're getting active!";
        if (count < 500) return "Power user detected!";
        if (count < 1000) return "Seriously committed!";
        return "Absolute legend! 🔥";
    };

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#050A19] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-8"
        >
            {/* Background effect */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#0052FF] rounded-full opacity-20 blur-[100px]"
                    animate={{
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                {/* Label */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/50 text-sm uppercase tracking-wider mb-8"
                >
                    In 2025, you made
                </motion.p>

                {/* Big number */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="relative"
                >
                    <span className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-[#0052FF] via-[#00C2FF] to-[#00FFA3] bg-clip-text text-transparent">
                        {count.toLocaleString()}
                    </span>

                    {/* Glow effect behind number */}
                    <div className="absolute inset-0 text-7xl md:text-8xl font-bold text-[#0052FF] blur-2xl opacity-50 -z-10">
                        {count.toLocaleString()}
                    </div>
                </motion.div>

                {/* Transaction label */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl text-white mt-4"
                >
                    transactions
                </motion.p>

                {/* Fun message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 px-6 py-3 rounded-2xl bg-white/5 border border-white/10"
                >
                    <p className="text-[#00FFA3] font-medium">{getTxMessage(targetCount)}</p>
                </motion.div>

                {/* Days active */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-6 text-white/40 text-sm"
                >
                    Active on {data.uniqueDaysActive} unique days
                </motion.p>
            </div>
        </div>
    );
}
