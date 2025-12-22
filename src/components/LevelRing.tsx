import { Level } from '@/constants/levels';
import { Skeleton } from './Skeleton';

interface LevelRingProps {
    currentLevel: Level;
    nextLevel: Level | null;
    progressPercent: number;
    isLoading?: boolean;
}

export function LevelRing({ currentLevel, nextLevel, progressPercent, isLoading }: LevelRingProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center">
                <Skeleton className="w-28 h-28 rounded-full mb-3" />
                <Skeleton className="w-20 h-5 mb-1" />
                <Skeleton className="w-24 h-3" />
            </div>
        );
    }

    // SVG Circle Math
    const size = 112;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center animate-fade-in">
            {/* Ring Container */}
            <div className="relative" style={{ width: size, height: size }}>

                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-pink/10 blur-xl animate-glow-pulse" />

                {/* Background Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-white/[0.05]"
                    />
                </svg>

                {/* Progress Ring with Gradient */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0052FF" />
                            <stop offset="50%" stopColor="#7B61FF" />
                            <stop offset="100%" stopColor="#FF61DC" />
                        </linearGradient>
                        {/* Glow Filter */}
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#progressGradient)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        filter="url(#glow)"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Orbiting Particle */}
                {progressPercent > 0 && (
                    <div
                        className="absolute w-2 h-2 rounded-full bg-accent-pink shadow-[0_0_10px_rgba(255,97,220,0.8)] animate-orbit"
                        style={{
                            top: '50%',
                            left: '50%',
                            marginTop: -4,
                            marginLeft: -4,
                        }}
                    />
                )}

                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl animate-float" style={{ animationDuration: '3s' }}>
                        {currentLevel.badge}
                    </div>
                </div>
            </div>

            {/* Level Info */}
            <div className="text-center mt-3">
                <h2 className="text-lg font-space-grotesk font-bold text-white mb-0.5">
                    {currentLevel.title}
                </h2>
                {nextLevel ? (
                    <p className="text-[10px] text-gray-500 font-jetbrains-mono uppercase tracking-wider">
                        <span className="gradient-text font-bold">{Math.round(progressPercent)}%</span>
                        <span className="mx-1">→</span>
                        {nextLevel.title}
                    </p>
                ) : (
                    <p className="text-[10px] gradient-text font-jetbrains-mono uppercase tracking-widest font-bold">
                        Max Level
                    </p>
                )}
            </div>
        </div>
    );
}
