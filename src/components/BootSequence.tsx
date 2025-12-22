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

    // System diagnostic messages
    const SYSTEM_LOGS = [
        'INITIALIZING_BASE_UPLINK...',
        'VERIFYING_CRYPTOGRAPHIC_SIGNATURES...',
        'ESTABLISHING_SECURE_TUNNEL_TO_SUPERCHAIN...',
        'DOWNLOADING_TRANSACTION_HISTORY_BATCH_1...',
        'DOWNLOADING_TRANSACTION_HISTORY_BATCH_2...',
        'ANALYZING_ERC20_TOKEN_TRANSFERS...',
        'CALCULATING_GAS_EXPENDITURE...',
        'AGGREGATING_PROTOCOL_INTERACTIONS...',
        'CROSS-REFERENCING_DEX_VOLUMES...',
        'VALIDATING_ON_CHAIN_IDENTITY...',
        'COMPILING_QUEST_COMPLETION_MATRIX...',
        'DETERMINING_BASE_SCORE_PERCENTILE...',
        'DIAGNOSTICS_COMPLETE.'
    ];

    // Sequence Controller
    useEffect(() => {
        const logInterval = setInterval(() => {
            setLogs(prev => {
                if (prev.length >= SYSTEM_LOGS.length) {
                    clearInterval(logInterval);
                    return prev;
                }
                return [...prev, SYSTEM_LOGS[prev.length]];
            });
        }, 350);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return Math.min(prev + Math.random() * 2.5, 99);
            });
        }, 120);

        return () => {
            clearInterval(logInterval);
            clearInterval(progressInterval);
        };
    }, []);

    // Finish trigger
    useEffect(() => {
        if (isDataReady && logs.length >= 6 && !isFinishing) {
            setProgress(100);
            setTimeout(() => {
                setIsFinishing(true);
                setTimeout(() => {
                    onComplete?.();
                }, 600);
            }, 400);
        }
    }, [isDataReady, logs.length, isFinishing, onComplete]);

    if (isFinishing && progress === 100) {
        return (
            <div className="fixed inset-0 z-[100] bg-white animate-fade-out pointer-events-none" />
        );
    }

    return (
        <div className="fixed inset-0 z-[99] bg-bg-primary flex flex-col items-center justify-center overflow-hidden">

            {/* Ambient Glows */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-purple/20 rounded-full blur-[120px] opacity-50" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-pink/15 rounded-full blur-[120px] opacity-50" />

            {/* Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(123,97,255,0.03),rgba(255,97,220,0.02),rgba(0,82,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-50" />

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-sm px-6 flex flex-col gap-10">

                {/* Logo Section */}
                <div className="relative flex justify-center py-6">
                    {/* Glow Rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-accent-purple/20 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-accent-pink/30 animate-pulse" />

                    {/* Logo */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink shadow-[0_0_60px_rgba(123,97,255,0.6)] flex items-center justify-center animate-float">
                        <div className="w-6 h-6 border-b-2 border-r-2 border-white rotate-45 transform -translate-y-0.5" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-[10px] font-jetbrains-mono text-accent-purple uppercase tracking-widest">
                        <span>System_Check</span>
                        <span>{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-accent-purple to-accent-pink shadow-[0_0_15px_rgba(123,97,255,0.8)] transition-all duration-100 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Terminal Logs */}
                <div className="h-32 font-jetbrains-mono text-[10px] text-gray-500 space-y-1 overflow-hidden mask-fade-bottom">
                    {logs.slice(-5).map((log, i) => (
                        <div key={i} className="flex gap-2 animate-slide-up">
                            <span className="gradient-text">➜</span>
                            <span className={i === logs.slice(-5).length - 1 ? 'text-white blink' : ''}>
                                {log}
                            </span>
                        </div>
                    ))}
                </div>

            </div>

            {/* Corner Brackets */}
            <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-accent-purple/30" />
            <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-accent-purple/30" />
            <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-accent-pink/30" />
            <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-accent-pink/30" />

            {/* Version */}
            <div className="absolute bottom-8 font-jetbrains-mono text-[9px] text-white/15 uppercase tracking-[0.3em]">
                Base_Score_v2.0
            </div>
        </div>
    );
}
