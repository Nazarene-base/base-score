'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';
import {
    getTwitterShareUrl,
    getWarpcastShareUrl,
    copyShareText,
    generateShareSVG
} from '@/lib/wrapped/share';

export function SummaryCard({ data }: WrappedCardProps) {
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const formatUSD = (usd: number) => {
        if (usd >= 1000000) return `$${(usd / 1000000).toFixed(1)}M`;
        if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
        return `$${usd.toFixed(0)}`;
    };

    const handleTwitterShare = () => {
        window.open(getTwitterShareUrl(data), '_blank');
    };

    const handleWarpcastShare = () => {
        window.open(getWarpcastShareUrl(data), '_blank');
    };

    const handleCopyText = async () => {
        const success = await copyShareText(data);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadSVG = () => {
        const svg = generateShareSVG(data);
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `base-wrapped-2025-${data.walletAddress.slice(0, 8)}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const stats = [
        { label: 'Transactions', value: data.totalTransactions.toLocaleString(), icon: '📊' },
        { label: 'Days Active', value: data.uniqueDaysActive.toString(), icon: '📅' },
        { label: 'Protocols', value: data.uniqueProtocolsUsed.toString(), icon: '🔗' },
        { label: 'NFTs', value: (data.nftsMinted + data.nftsReceived).toString(), icon: '🖼️' },
        { label: 'Volume', value: formatUSD(data.totalVolumeUSD), icon: '💰' },
        { label: 'Gas Saved', value: formatUSD(data.gasSavedVsL1USD), icon: '⛽' },
    ];

    return (
        <div
            className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#050A19] border border-white/10 overflow-hidden flex flex-col"
        >
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0052FF]/5 via-transparent to-[#00FFA3]/5" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-5 overflow-y-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-3"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 mb-2">
                        <span className="text-sm text-[#00C2FF]">2025 Summary</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">That's a Wrap!</h2>
                </motion.div>

                {/* Tribe badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-3"
                >
                    <span className="text-3xl">{data.tribeInfo.icon}</span>
                    <div className="text-left">
                        <div className="text-white/50 text-xs uppercase tracking-wider">Your Tribe</div>
                        <div className="text-lg font-bold" style={{ color: data.tribeInfo.color }}>
                            {data.tribe}
                        </div>
                    </div>
                </motion.div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-sm">{stat.icon}</span>
                                <span className="text-white/40 text-xs uppercase">{stat.label}</span>
                            </div>
                            <div className="text-lg font-bold text-white">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Share buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                >
                    {/* Main share buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleTwitterShare(); }}
                            className="flex-1 p-3 rounded-xl bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            Share on X
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleWarpcastShare(); }}
                            className="flex-1 p-3 rounded-xl bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            Warpcast
                        </button>
                    </div>

                    {/* More options */}
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 text-sm flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            More sharing options
                        </button>

                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-[#0A1628] border border-white/20 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={handleCopyText}
                                    className="w-full p-2 rounded-lg hover:bg-white/10 text-left text-sm text-white/70 flex items-center gap-2"
                                >
                                    <span>{copied ? '✓' : '📋'}</span>
                                    {copied ? 'Copied!' : 'Copy share text'}
                                </button>
                                <button
                                    onClick={handleDownloadSVG}
                                    className="w-full p-2 rounded-lg hover:bg-white/10 text-left text-sm text-white/70 flex items-center gap-2"
                                >
                                    <span>🖼️</span>
                                    Download as image
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Wallet info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-auto pt-3 text-center"
                >
                    {data.basenameName ? (
                        <span className="text-[#00FFA3] font-medium">{data.basenameName}</span>
                    ) : (
                        <span className="text-white/40 font-mono text-sm">
                            {data.walletAddress.slice(0, 6)}...{data.walletAddress.slice(-4)}
                        </span>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
