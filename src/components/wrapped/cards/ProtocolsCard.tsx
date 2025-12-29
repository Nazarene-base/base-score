'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function ProtocolsCard({ data, onNext }: WrappedCardProps) {
    const getProtocolEmoji = (name: string) => {
        const emojis: Record<string, string> = {
            // DEXs
            'Uniswap': '🦄',
            'Aerodrome': '✈️',
            'BaseSwap': '🔄',
            'Odos': '🐙',
            '1inch': '🦊',
            'KyberSwap': '💎',
            'SushiSwap': '🍣',
            'Maverick': '🎯',
            'LI.FI': '🔗',
            'Paraswap': '🦜',
            // Bridges
            'Base Bridge': '🌉',
            'Stargate': '⭐',
            'Synapse': '🧠',
            'Hop': '🐰',
            'Socket': '🔌',
            'LayerZero': '0️⃣',
            'Across': '🌊',
            // NFT
            'Zora': '🎨',
            'Highlight': '✨',
            'OpenSea': '🌊',
            'Reservoir': '💧',
            'Base Paint': '🖌️',
            'Party Protocol': '🎉',
            'ERC-6551': '🤖',
            // DeFi
            'Aave': '👻',
            'Compound': '🏦',
            'Moonwell': '🌙',
            'Morpho': '🦋',
            'Extra Finance': '💰',
            'Seamless': '🧵',
            'Beefy': '🐮',
            // Identity
            'Basename': '📛',
            'Warpcast': '💬',
            // Tokens/Other
            'USDC': '💵',
            'WETH': 'Ξ',
            'DAI': '📀',
            'cbETH': '🔷',
            'rETH': '🚀',
            'Multicall3': '📞',
            'Gnosis Safe': '🔐',
            'Safe': '🔐',
            'None': '❓',
        };
        return emojis[name] || '🔵';
    };

    const getProtocolColor = (index: number) => {
        const colors = ['#0052FF', '#00C2FF', '#00FFA3'];
        return colors[index] || colors[2];
    };

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#0A1628] to-[#050A19] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-8"
        >
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-48 h-48 bg-[#0052FF] rounded-full opacity-20 blur-[100px]"
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#00FFA3] rounded-full opacity-15 blur-[80px]"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center w-full max-w-sm">
                {/* Label */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/50 text-sm uppercase tracking-wider mb-6"
                >
                    Your favorite protocols
                </motion.p>

                {/* Protocol count */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <span className="text-5xl font-bold text-white">{data.uniqueProtocolsUsed}</span>
                    <span className="text-xl text-white/60 ml-2">protocols used</span>
                </motion.div>

                {/* Top protocols */}
                {data.protocolBreakdown.length > 0 ? (
                    <div className="space-y-3">
                        {data.protocolBreakdown.slice(0, 3).map((protocol, index) => (
                            <motion.div
                                key={protocol.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.15 }}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                            >
                                {/* Rank */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                                    style={{ backgroundColor: `${getProtocolColor(index)}20`, color: getProtocolColor(index) }}
                                >
                                    {index + 1}
                                </div>

                                {/* Emoji */}
                                <div className="text-2xl">{getProtocolEmoji(protocol.name)}</div>

                                {/* Name & stats */}
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-white">{protocol.name}</div>
                                    <div className="text-sm text-white/40">{protocol.count} txs</div>
                                </div>

                                {/* Percentage */}
                                <div className="text-right">
                                    <div
                                        className="text-lg font-bold"
                                        style={{ color: getProtocolColor(index) }}
                                    >
                                        {protocol.percentage}%
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-white/40"
                    >
                        No tracked protocols used yet
                    </motion.div>
                )}

                {/* Favorite highlight */}
                {data.favoriteProtocol !== 'None' && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-6 text-[#00FFA3] text-sm"
                    >
                        {getProtocolEmoji(data.favoriteProtocol)} {data.favoriteProtocol} is your #1!
                    </motion.p>
                )}
            </div>
        </div>
    );
}
