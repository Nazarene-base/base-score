'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function MomentsCard({ data, onNext }: WrappedCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

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
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/30 mb-4">
                        <span className="text-xl">✨</span>
                        <span className="text-sm text-[#00C2FF]">Special Moments</span>
                    </div>
                </motion.div>

                {/* Lucky transaction */}
                {data.luckyTransaction && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-[#00FFA3]/10 to-transparent rounded-2xl p-5 mb-4 border border-[#00FFA3]/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">🍀</span>
                            <div>
                                <p className="text-white/40 text-xs uppercase tracking-wider">Luckiest Transaction</p>
                                <p className="text-[#00FFA3] font-bold">
                                    ${data.luckyTransaction.gasUSD.toFixed(4)} gas
                                </p>
                            </div>
                        </div>
                        <p className="text-white/50 text-sm">
                            On {formatDate(data.luckyTransaction.date)}, you hit the gas sweet spot.
                            Timing is everything!
                        </p>
                    </motion.div>
                )}

                {/* Busiest day */}
                {data.busiestDay && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-transparent to-[#FF6B35]/10 rounded-2xl p-5 mb-4 border border-[#FF6B35]/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">🔥</span>
                            <div>
                                <p className="text-white/40 text-xs uppercase tracking-wider">Busiest Day</p>
                                <p className="text-[#FF6B35] font-bold">
                                    {data.busiestDay.count} transactions
                                </p>
                            </div>
                        </div>
                        <p className="text-white/50 text-sm">
                            On {formatDate(data.busiestDay.date)}, you were on fire!
                            That's some serious activity.
                        </p>
                    </motion.div>
                )}

                {/* Total transactions stat */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-4"
                >
                    <p className="text-white/30 text-sm">
                        These were just highlights from your {data.totalTransactions.toLocaleString()} transactions
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
