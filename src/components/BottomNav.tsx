import { HomeIcon, ChartBarIcon } from './Icons';

// Compare Icon
function CompareIcon(props: any) {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

interface BottomNavProps {
    activeTab: 'score' | 'pnl' | 'compare' | 'profile';
    visible: boolean;
    onChange: (tab: 'score' | 'pnl' | 'compare' | 'profile') => void;
}

export function BottomNav({ activeTab, visible, onChange }: BottomNavProps) {
    if (!visible) return null;

    const tabs = [
        { id: 'score', label: 'Score', icon: HomeIcon },
        { id: 'pnl', label: 'Market', icon: ChartBarIcon },
        { id: 'compare', label: 'Compare', icon: CompareIcon },
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 pointer-events-none">
            <div className="max-w-sm mx-auto pointer-events-auto">
                {/* Floating Island Container - Compact for Mobile */}
                <div className="
                    flex justify-around items-center 
                    glass-card rounded-full
                    px-3 py-2
                    border border-white/[0.08]
                    shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]
                ">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onChange(tab.id)}
                                className={`
                                    relative flex flex-col items-center gap-1 
                                    px-5 py-2 rounded-full
                                    transition-all duration-300 ease-out
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }
                                `}
                            >
                                {/* Active Background Pill - Base Blue */}
                                {isActive && (
                                    <div className="
                                        absolute inset-0 rounded-full
                                        bg-gradient-to-r from-base-blue/30 to-accent-purple/20
                                        animate-fade-in
                                    " />
                                )}

                                {/* Icon */}
                                <div className={`
                                    relative z-10 transition-transform duration-300
                                    ${isActive ? 'scale-110' : 'scale-100'}
                                `}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                {/* Label - Always Visible */}
                                <span className={`
                                    relative z-10 text-[10px] font-medium tracking-wide
                                    transition-all duration-300
                                    ${isActive
                                        ? 'opacity-100 text-white'
                                        : 'opacity-60 text-gray-400'
                                    }
                                `}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
