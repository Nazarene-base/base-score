'use client';

import { useEffect, useState } from 'react';

interface BootSequenceProps {
    onComplete?: () => void;
    isDataReady: boolean;
}

export function BootSequence({ onComplete, isDataReady }: BootSequenceProps) {
    const [step, setStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);

    // Diagnostic log messages
    const SYSTEM_LOGS = [
        'INITIALIZING_BASE_UPLINK...',
        'VERIFYING_CRYPTOGRAPHIC_SIGNATURES...',
        'ESTABLISHING_SECURE_TUNNEL_TO_SUPERCHAIN...',
        'DOWNLOADING_TRANSACTION_HISTORY_BATCH_1...',
        'DOWNLOADING_TRANSACTION_HISTORY_BATCH_2...',
        'ANALYZING_ERC20_TOKEN_TRANSFERS...',
        'CALCULATING_GAS_EXPENDITURE...',
        'AGGREGATING_PROTOCOL_INTERACTIONS...',
        'DETERMINING_ON_CHAIN_REPUTATION_SCORE...',
        'DIAGNOSTICS_COMPLETE.'
    ];

    // Sequence Controller
    useEffect(() => {
        // Stage 1: Fast initial logs
        const logInterval = setInterval(() => {
            setLogs(prev => {
                if (prev.length >= SYSTEM_LOGS.length) {
                    clearInterval(logInterval);
                    return prev;
                }
                return [...prev, SYSTEM_LOGS[prev.length]];
            });
        }, 150);

        // Stage 2: Progress bar simulation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                // Randomize speed for realism
                return Math.min(prev + Math.random() * 5, 99);
            });
        }, 100);

        return () => {
            clearInterval(logInterval);
            clearInterval(progressInterval);
        };
    }, []);

    // Finish trigger
    useEffect(() => {
        // Only finish if data is ready AND minimum animation time passed (e.g. logs done)
        if (isDataReady && logs.length >= 5 && !isFinishing) {
            // Force progress to 100
            setProgress(100);

            // Dramatic pause at 100%
            setTimeout(() => {
                setIsFinishing(true);
                // Fade out transition
                setTimeout(() => {
                    onComplete?.();
                }, 800); // 800ms fade out
            }, 500);
        }
    }, [isDataReady, logs.length, isFinishing, onComplete]);

    if (isFinishing && progress === 100) {
        // The "Flash" transition state
        return (
            <div className="fixed inset-0 z-[100] bg-white animate-fade-out pointer-events-none" />
        );
    }

    return (
        <div className="fixed inset-0 z-[99] bg-[#050608] flex flex-col items-center justify-center overflow-hidden">
            {/* 1. Background Grid / Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,82,255,0.15)_0%,transparent_70%)] z-0" />

            {/* 2. Main Content Container */}
            <div className="relative z-10 w-full max-w-sm px-6 flex flex-col gap-8">

                {/* Central Logo - Pulsing */}
                <div className="relative flex justify-center py-8">
                    {/* Outer glow rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-base-blue/20 animate-ping [animation-duration:2s]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-base-blue/40 animate-pulse" />

                    {/* The Logo */}
                    <div className="w-16 h-16 rounded-full bg-base-blue shadow-[0_0_50px_rgba(0,82,255,0.6)] flex items-center justify-center animate-bounce-slight">
                        <div className="w-6 h-6 border-b-2 border-r-2 border-white rotate-45 transform -translate-y-0.5" />
                    </div>
                </div>

                {/* 3. Progress Bar - High Tech */}
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-[10px] font-jetbrains-mono text-base-blue uppercase tracking-widest">
                        <span>System_Check</span>
                        <span>{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-1 w-full bg-base-blue/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-base-blue shadow-[0_0_10px_#0052FF] transition-all duration-100 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* 4. Terminal Logs */}
                <div className="h-32 font-jetbrains-mono text-[10px] text-gray-500 space-y-1 overflow-hidden mask-fade-bottom">
                    {logs.slice(-4).map((log, i) => ( // Show last 4 logs
                        <div key={i} className="flex gap-2 animate-slide-up">
                            <span className="text-base-blue">➜</span>
                            <span className={i === logs.slice(-4).length - 1 ? 'text-white blink' : ''}>
                                {log}
                            </span>
                        </div>
                    ))}
                </div>

            </div>

            {/* 5. Decorative "HUD" Corners */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/20" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/20" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/20" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/20" />

            {/* 6. Version Text */}
            <div className="absolute bottom-6 font-jetbrains-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">
                Base_Score_Systems_v1.0.4
            </div>
        </div>
    );
}
