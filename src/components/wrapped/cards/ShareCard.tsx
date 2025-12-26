'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function ShareCard({ data }: WrappedCardProps) {
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const formatUSD = (usd: number) => {
        if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
        return `$${usd.toFixed(0)}`;
    };

    const shareText = `🔵 My Base Year Wrapped 2025

${data.tribeInfo.icon} I'm a ${data.tribe}!

📊 ${data.totalTransactions.toLocaleString()} transactions
📅 ${data.uniqueDaysActive} days active
🔗 ${data.uniqueProtocolsUsed} protocols used
💰 ${formatUSD(data.totalVolumeUSD)} volume

Check your #BaseWrapped at basescore.xyz/wrapped`;

    const handleTwitterShare = () => {
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(tweetUrl, '_blank');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/wrapped?address=${data.walletAddress}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        // Placeholder for image generation
        // In production, use html2canvas or similar
        setTimeout(() => {
            setIsGenerating(false);
            alert('Image download coming soon!');
        }, 1000);
    };

    return (
        <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#050A19] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#0052FF] rounded-full opacity-15 blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#00FFA3] rounded-full opacity-15 blur-[80px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center w-full max-w-sm">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="text-5xl mb-3">🎉</div>
                    <h2 className="text-2xl font-bold text-white mb-2">That's a Wrap!</h2>
                    <p className="text-white/50">Share your 2025 Base journey</p>
                </motion.div>

                {/* Mini summary card preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-[#0052FF]/20 to-[#00FFA3]/20 border border-white/10 mb-6"
                >
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="text-3xl">{data.tribeInfo.icon}</span>
                        <span className="text-lg font-bold" style={{ color: data.tribeInfo.color }}>
                            {data.tribe}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                            <div className="text-white font-bold">{data.totalTransactions}</div>
                            <div className="text-white/40 text-xs">TXs</div>
                        </div>
                        <div>
                            <div className="text-white font-bold">{data.uniqueDaysActive}</div>
                            <div className="text-white/40 text-xs">Days</div>
                        </div>
                        <div>
                            <div className="text-white font-bold">{data.uniqueProtocolsUsed}</div>
                            <div className="text-white/40 text-xs">Protocols</div>
                        </div>
                    </div>
                </motion.div>

                {/* Share buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                >
                    {/* Twitter */}
                    <button
                        onClick={handleTwitterShare}
                        className="w-full p-4 rounded-2xl bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 transition-colors flex items-center justify-center gap-3 font-medium"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Share on X
                    </button>

                    {/* Copy link */}
                    <button
                        onClick={handleCopyLink}
                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-3 font-medium"
                    >
                        {copied ? (
                            <>
                                <svg className="w-5 h-5 text-[#00FFA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[#00FFA3]">Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy Link
                            </>
                        )}
                    </button>

                    {/* Download */}
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-3 font-medium disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Generating...
                            </span>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Image
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 text-white/30 text-sm"
                >
                    Powered by Base Score
                </motion.p>
            </div>
        </div>
    );
}
