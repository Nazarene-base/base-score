'use client';

import { motion } from 'framer-motion';
import { WrappedCardProps } from '@/types/wrapped';

export function ActivityCard({ data, onNext }: WrappedCardProps) {
    const getTimeEmoji = () => {
        switch (data.preferredTimeOfDay) {
            case 'morning': return '🌅';
            case 'afternoon': return '☀️';
            case 'evening': return '🌆';
            case 'night': return '🌙';
        }
    };

    const getTimeMessage = () => {
        switch (data.preferredTimeOfDay) {
            case 'morning': return "You're an early bird! Your best ideas come with the sunrise.";
            case 'afternoon': return "Peak productivity hours. You hit your stride when the sun is high.";
            case 'evening': return "Evening vibes. You unwind by getting things done onchain.";
            case 'night': return "Night owl mode. When the world sleeps, you build.";
        }
    };

    return (
        <div
            onClick={onNext}
            className="relative w-full h-full rounded-3xl overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(135deg, #0A1628 0%, #050A19 100%)' }}
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
                        <span className="text-xl">📅</span>
                        <span className="text-sm text-[#00C2FF]">Your Rhythm</span>
                    </div>
                </motion.div>

                {/* Most active month */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 rounded-2xl p-5 mb-4 border border-white/10"
                >
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Hottest Month</p>
                    <p className="text-2xl font-bold text-white">{data.mostActiveMonth}</p>
                    <p className="text-white/50 text-sm mt-1">This was your peak season onchain</p>
                </motion.div>

                {/* Most active day */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 rounded-2xl p-5 mb-4 border border-white/10"
                >
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Favorite Day</p>
                    <p className="text-2xl font-bold text-white">{data.mostActiveDay}</p>
                    <p className="text-white/50 text-sm mt-1">
                        {data.mostActiveDay === 'Saturday' || data.mostActiveDay === 'Sunday'
                            ? "Weekend warrior vibes 💪"
                            : "Weekday grinder energy 🔥"}
                    </p>
                </motion.div>

                {/* Preferred time */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-r from-[#0052FF]/20 to-[#00FFA3]/20 rounded-2xl p-5 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getTimeEmoji()}</span>
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider">Your Vibe</p>
                            <p className="text-xl font-bold text-white capitalize">{data.preferredTimeOfDay}</p>
                        </div>
                    </div>
                    <p className="text-white/50 text-sm">{getTimeMessage()}</p>
                </motion.div>
            </div>
        </div>
    );
}
