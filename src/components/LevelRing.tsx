import { Level } from '@/constants/levels';
import { Skeleton } from './Skeleton';

interface LevelRingProps {
    currentLevel: Level;
    nextLevel: Level | null;
    progressPercent: number; // 0-100 progress to next level
    isLoading?: boolean;
}

export function LevelRing({ currentLevel, nextLevel, progressPercent, isLoading }: LevelRingProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <Skeleton className="w-32 h-32 rounded-full mb-4" />
                <Skeleton className="w-24 h-6 mb-2" />
                <Skeleton className="w-32 h-4" />
            </div>
        );
    }

    // Calculate Dash Offset for SVG Circle
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center py-8 animate-fade-in text-center">
            {/* Ring Container */}
            <div className="relative w-32 h-32 mb-4">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/5"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="text-base-blue transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    {currentLevel.badge}
                </div>
            </div>

            {/* Level Title */}
            <h2 className="text-2xl font-space-grotesk font-bold text-white mb-1">
                {currentLevel.title}
            </h2>

            {/* Next Level Hint */}
            {nextLevel ? (
                <p className="text-xs text-gray-500 font-jetbrains-mono uppercase tracking-widest">
                    Next: {nextLevel.title} ({Math.round(progressPercent)}%)
                </p>
            ) : (
                <p className="text-xs text-base-blue font-jetbrains-mono uppercase tracking-widest">
                    Max Level Reached
                </p>
            )}
        </div>
    );
}
