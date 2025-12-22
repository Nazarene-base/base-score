import { HomeIcon, ChartBarIcon, UserIcon } from './Icons'; // Assuming icons exist or I'll create them

interface BottomNavProps {
    activeTab: 'score' | 'pnl' | 'profile';
    visible: boolean;
    onChange: (tab: 'score' | 'pnl' | 'profile') => void;
}

export function BottomNav({ activeTab, visible, onChange }: BottomNavProps) {
    if (!visible) return null;

    const tabs = [
        { id: 'score', label: 'Home', icon: HomeIcon },
        { id: 'pnl', label: 'Market', icon: ChartBarIcon },
        // { id: 'profile', label: 'Profile', icon: UserIcon }, // Future use
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 bg-bg-primary/90 backdrop-blur-xl border-t border-white/[0.05]">
            <div className="flex justify-around items-center max-w-lg mx-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-base-blue scale-105' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-base-blue/10' : 'bg-transparent'}`}>
                                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : 'stroke-current'}`} />
                            </div>
                            <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
