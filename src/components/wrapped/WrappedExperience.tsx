'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { WrappedData } from '@/types/wrapped';

// Import all 19 cards
import { WelcomeCard } from './cards/WelcomeCard';
import { BirthdayCard } from './cards/BirthdayCard';
import { TeaserCard } from './cards/TeaserCard';
import { TransactionsCard } from './cards/TransactionsCard';
import { ActivityCard } from './cards/ActivityCard';
import { StreakCard } from './cards/StreakCard';
import { GasHeroCard } from './cards/GasHeroCard';
import { ProtocolsCard } from './cards/ProtocolsCard';
import { DexCard } from './cards/DexCard';
import { BiggestSwapCard } from './cards/BiggestSwapCard';
import { NftCard } from './cards/NftCard';
import { PaymentsCard } from './cards/PaymentsCard';
import { SmartWalletCard } from './cards/SmartWalletCard';
import { BadgesCard } from './cards/BadgesCard';
import { MomentsCard } from './cards/MomentsCard';
import { RankCard } from './cards/RankCard';
import { TribeCard } from './cards/TribeCard';
import { ComparisonCard } from './cards/ComparisonCard';
import { SummaryCard } from './cards/SummaryCard';

interface WrappedExperienceProps {
    data: WrappedData;
    onBack: () => void;
}

const SWIPE_THRESHOLD = 50;

// BUG-L2 FIX: Pre-generate stable random values for particles
const PARTICLE_CONFIG = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: (17 * i + 23) % 100,        // Pseudo-random using deterministic formula
    top: (31 * i + 47) % 100,
    duration: 3 + (i % 3),            // Varies between 3-5 seconds
    delay: (i * 0.2) % 2,             // Staggered delays
}));

// Floating particles component for background ambiance
function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {PARTICLE_CONFIG.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute w-1 h-1 rounded-full bg-[#00FFA3]"
                    style={{
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}


export function WrappedExperience({ data, onBack }: WrappedExperienceProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Full 19-card sequence
    const cards = [
        { id: 'welcome', component: WelcomeCard },
        { id: 'birthday', component: BirthdayCard },
        { id: 'teaser', component: TeaserCard },
        { id: 'transactions', component: TransactionsCard },
        { id: 'activity', component: ActivityCard },
        { id: 'streak', component: StreakCard },
        { id: 'gas', component: GasHeroCard },
        { id: 'protocols', component: ProtocolsCard },
        { id: 'defi', component: DexCard },
        { id: 'biggestSwap', component: BiggestSwapCard },
        { id: 'nft', component: NftCard },
        { id: 'payments', component: PaymentsCard },
        { id: 'smartWallet', component: SmartWalletCard },
        { id: 'badges', component: BadgesCard },
        { id: 'moments', component: MomentsCard },
        { id: 'rank', component: RankCard },
        { id: 'tribe', component: TribeCard },
        { id: 'comparison', component: ComparisonCard },
        { id: 'summary', component: SummaryCard },
    ];

    const totalCards = cards.length;

    const goToNext = useCallback(() => {
        if (currentIndex < totalCards - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, totalCards]);

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -SWIPE_THRESHOLD) {
            goToNext();
        } else if (info.offset.x > SWIPE_THRESHOLD) {
            goToPrev();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'Escape') onBack();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrev, onBack]);

    const CurrentCard = cards[currentIndex].component;

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.9,
            rotateY: direction > 0 ? 15 : -15,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
        },
        exit: (direction: number) => ({
            x: direction > 0 ? '-50%' : '50%',
            opacity: 0,
            scale: 0.9,
            rotateY: direction > 0 ? -10 : 10,
        }),
    };

    return (
        <div className="fixed inset-0 bg-[#050A19] overflow-hidden">
            {/* Animated background gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-0 left-0 w-full h-full"
                    animate={{
                        background: [
                            'radial-gradient(ellipse at 30% 20%, rgba(0, 82, 255, 0.15) 0%, transparent 50%)',
                            'radial-gradient(ellipse at 70% 80%, rgba(0, 82, 255, 0.15) 0%, transparent 50%)',
                            'radial-gradient(ellipse at 30% 20%, rgba(0, 82, 255, 0.15) 0%, transparent 50%)',
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    className="absolute top-0 left-0 w-full h-full"
                    animate={{
                        background: [
                            'radial-gradient(ellipse at 70% 30%, rgba(0, 255, 163, 0.1) 0%, transparent 50%)',
                            'radial-gradient(ellipse at 30% 70%, rgba(0, 255, 163, 0.1) 0%, transparent 50%)',
                            'radial-gradient(ellipse at 70% 30%, rgba(0, 255, 163, 0.1) 0%, transparent 50%)',
                        ],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Floating particles */}
            <FloatingParticles />

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors p-2 -m-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="text-sm text-white/40 font-mono bg-white/5 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {totalCards}
                </div>
            </header>

            {/* Card Container */}
            <div className="relative w-full h-full flex items-center justify-center pt-16 pb-24 px-4">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 350, damping: 35 },
                            opacity: { duration: 0.25 },
                            scale: { duration: 0.25 },
                            rotateY: { duration: 0.3 },
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.15}
                        onDragEnd={handleDragEnd}
                        className="w-full max-w-md h-full max-h-[650px] cursor-grab active:cursor-grabbing perspective-1000"
                    >
                        <CurrentCard
                            data={data}
                            onNext={goToNext}
                            onPrev={goToPrev}
                            currentIndex={currentIndex}
                            totalCards={totalCards}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-16 left-6 right-6">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#0052FF] to-[#00FFA3]"
                        animate={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>
            </div>

            {/* Navigation hints */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                <motion.button
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </motion.button>
                <motion.button
                    onClick={goToNext}
                    disabled={currentIndex === totalCards - 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00FFA3] flex items-center justify-center text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </motion.button>
            </div>

            {/* Tap zones for mobile */}
            <div className="absolute inset-0 flex pointer-events-none" style={{ top: '80px', bottom: '120px' }}>
                <button
                    onClick={goToPrev}
                    className="w-1/4 h-full pointer-events-auto opacity-0"
                    disabled={currentIndex === 0}
                />
                <div className="flex-1" />
                <button
                    onClick={goToNext}
                    className="w-1/4 h-full pointer-events-auto opacity-0"
                    disabled={currentIndex === totalCards - 1}
                />
            </div>
        </div>
    );
}
