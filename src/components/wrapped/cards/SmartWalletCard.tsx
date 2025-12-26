'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function SmartWalletCard({ data, onNext }: WrappedCardProps) {
    const hasSmartWallet = data.hasSmartWallet || data.gaslessTransactions > 0;

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col items-center justify-center px-6"
            style={{ background: 'linear-gradient(180deg, #0A1628 0%, #050A19 100%)' }}
        >
            {/* Circuit pattern background */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="circuit" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M25 0 v25 h25" fill="none" stroke="#0052FF" strokeWidth="0.5" />
                        <circle cx="25" cy="25" r="2" fill="#0052FF" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#circuit)" />
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="text-7xl mb-6"
                >
                    {hasSmartWallet ? '🧠' : '💡'}
                </motion.div>

                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-4"
                >
                    {hasSmartWallet ? 'Smart Wallet User!' : 'Smart Wallets'}
                </motion.h3>

                {hasSmartWallet ? (
                    <>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/60 mb-6 max-w-xs mx-auto"
                        >
                            You're ahead of the curve! Smart wallets bring better UX and often gasless transactions.
                        </motion.p>

                        {data.gaslessTransactions > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FFA3]/20 border border-[#00FFA3]/30"
                            >
                                <span className="text-[#00FFA3]">⚡</span>
                                <span className="text-[#00FFA3]">
                                    {data.gaslessTransactions} gasless transactions
                                </span>
                            </motion.div>
                        )}
                    </>
                ) : (
                    <>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/60 mb-6 max-w-xs mx-auto"
                        >
                            Smart wallets are the future of crypto UX. Easier onboarding, gasless transactions, and more!
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-white/40 text-sm"
                        >
                            Consider trying Coinbase Smart Wallet in 2025!
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
