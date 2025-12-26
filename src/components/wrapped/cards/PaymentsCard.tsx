'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { WrappedCardProps } from '@/types/wrapped';

export function PaymentsCard({ data, onNext }: WrappedCardProps) {
    const formatUSD = (usd: number) => {
        if (usd >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
        if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
        if (usd >= 1) return `$${usd.toFixed(2)}`;
        return `$${usd.toFixed(2)}`;
    };

    const totalActivity = data.usdcSentTotal + data.usdcReceivedTotal;
    const hasPaymentActivity = totalActivity > 0;

    const getMessage = () => {
        if (!hasPaymentActivity) return "No USDC payments detected this year. Stablecoins are a great way to pay and get paid!";
        if (data.usdcSentTotal > data.usdcReceivedTotal * 2) return "You're generous! You sent more than you received.";
        if (data.usdcReceivedTotal > data.usdcSentTotal * 2) return "Cha-ching! You're earning like a pro.";
        return "Nice balance of sending and receiving. You're an active participant!";
    };

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(180deg, #0A1628 0%, #050A19 100%)' }}
        >
            {/* USDC coin animation */}
            <motion.div
                className="absolute top-20 right-10 w-16 h-16 rounded-full border-4 border-[#2775CA] flex items-center justify-center bg-[#2775CA]/20"
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
            >
                <span className="text-2xl font-bold text-[#2775CA]">$</span>
            </motion.div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2775CA]/20 border border-[#2775CA]/30 mb-4">
                        <span className="text-xl">💸</span>
                        <span className="text-sm text-[#2775CA]">Commerce & Payments</span>
                    </div>
                </motion.div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-[#00FFA3]/10 to-transparent rounded-2xl p-4 border border-[#00FFA3]/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📥</span>
                            <span className="text-white/40 text-xs uppercase">Received</span>
                        </div>
                        <div className="text-2xl font-bold text-[#00FFA3]">
                            <CountUp end={data.usdcReceivedTotal} duration={1.5} prefix="$" separator="," decimals={0} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-2xl p-4 border border-[#FF6B35]/20"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📤</span>
                            <span className="text-white/40 text-xs uppercase">Sent</span>
                        </div>
                        <div className="text-2xl font-bold text-[#FF6B35]">
                            <CountUp end={data.usdcSentTotal} duration={1.5} prefix="$" separator="," decimals={0} />
                        </div>
                    </motion.div>
                </div>

                {/* Additional stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-4"
                >
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-white/40 text-sm">People Paid</span>
                        <span className="text-white font-bold">{data.uniquePaymentRecipients}</span>
                    </div>
                    {data.largestPaymentUSD > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-white/40 text-sm">Largest Payment</span>
                            <span className="text-white font-bold">{formatUSD(data.largestPaymentUSD)}</span>
                        </div>
                    )}
                </motion.div>

                {/* Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-white/40 text-sm text-center"
                >
                    {getMessage()}
                </motion.p>

                {/* Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-white/20 text-xs text-center mt-4"
                >
                    USDC transfers (excluding DEX swaps)
                </motion.p>
            </div>
        </div>
    );
}
