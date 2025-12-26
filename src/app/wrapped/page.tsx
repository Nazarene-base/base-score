'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useWrappedData } from '@/hooks/useWrappedData';
import { WrappedExperience } from '@/components/wrapped/WrappedExperience';
import { resolveAddressOrName, isEnsName, isValidAddress } from '@/lib/ens';

export default function WrappedPage() {
    const router = useRouter();
    const { isConnected, address } = useAccount();
    const [inputAddress, setInputAddress] = useState('');
    const [showExperience, setShowExperience] = useState(false);
    const [resolvedInfo, setResolvedInfo] = useState<{ address: string; name: string | null } | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    const {
        isLoading,
        error,
        data,
        setTargetAddress,
        targetAddress,
        isUsingConnectedWallet,
        refetch
    } = useWrappedData();

    const handleSearch = async () => {
        const input = inputAddress.trim();
        if (!input) return;

        // Check if it's an ENS name that needs resolution
        if (isEnsName(input)) {
            setIsResolving(true);
            setResolvedInfo(null);

            const resolution = await resolveAddressOrName(input);
            setIsResolving(false);

            if (resolution.error || !resolution.address) {
                // Show error via useWrappedData's error state (we'll set target to invalid)
                alert(resolution.error || 'Could not resolve name');
                return;
            }

            setResolvedInfo({ address: resolution.address, name: resolution.resolvedName });
            setTargetAddress(resolution.address);
            setShowExperience(true);
        } else if (isValidAddress(input)) {
            setResolvedInfo(null);
            setTargetAddress(input);
            setShowExperience(true);
        } else {
            alert('Please enter a valid address (0x...) or ENS name (.eth or .base.eth)');
        }
    };

    const handleUseConnectedWallet = () => {
        if (address) {
            setResolvedInfo(null);
            setTargetAddress('');
            setInputAddress('');
            setShowExperience(true);
        }
    };

    const handleBack = () => {
        if (showExperience) {
            setShowExperience(false);
            setResolvedInfo(null);
        } else {
            router.push('/');
        }
    };

    // Helper to detect if user is typing an ENS name
    const isTypingEns = inputAddress.includes('.eth') || inputAddress.includes('.base');

    // Show the wrapped experience if we have data and user initiated it
    if (showExperience && data && !isLoading) {
        return (
            <WrappedExperience
                data={data}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#050A19] text-white flex flex-col">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0052FF] opacity-20 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00FFA3] opacity-15 blur-[150px] rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/5">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <div className="text-sm text-white/40">2025</div>
            </header>

            {/* Main content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
                {/* Logo/Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 mb-6">
                        <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
                        <span className="text-sm font-medium text-[#00C2FF]">Base Year Wrapped</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#00C2FF] to-[#00FFA3] bg-clip-text text-transparent">
                        Your Year on Base
                    </h1>
                    <p className="text-white/50 text-lg max-w-md mx-auto">
                        Discover your 2025 onchain journey. See your transactions, favorite protocols, and more.
                    </p>
                </div>

                {/* Wallet Input Section */}
                <div className="w-full max-w-md space-y-4">
                    {/* Connected Wallet Option */}
                    {isConnected && address && (
                        <button
                            onClick={handleUseConnectedWallet}
                            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#0052FF]/20 to-[#00FFA3]/20 border border-[#0052FF]/30 hover:border-[#00FFA3]/50 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#0052FF] flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm text-white/50">Connected Wallet</div>
                                        <div className="font-mono text-sm">
                                            {address.slice(0, 6)}...{address.slice(-4)}
                                        </div>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-[#00FFA3] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/30 text-sm">or search any wallet</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={inputAddress}
                            onChange={(e) => setInputAddress(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="0x... or name.eth or name.base.eth"
                            className="w-full p-4 pl-12 rounded-2xl bg-white/5 border border-white/10 focus:border-[#0052FF]/50 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 transition-all font-mono text-sm placeholder:text-white/30"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* ENS hint */}
                    {isTypingEns && (
                        <div className="p-3 rounded-xl bg-[#0052FF]/10 border border-[#0052FF]/20 text-[#00C2FF] text-xs">
                            ✨ ENS names supported! We'll resolve .eth and .base.eth for you.
                        </div>
                    )}

                    {/* Resolved info */}
                    {resolvedInfo && (
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                            <p className="text-green-400 text-sm">
                                ✓ Resolved <span className="font-bold">{resolvedInfo.name}</span>
                                <span className="text-white/40 ml-2">({resolvedInfo.address.slice(0, 6)}...{resolvedInfo.address.slice(-4)})</span>
                            </p>
                        </div>
                    )}

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={!inputAddress || isLoading || isResolving}
                        className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#0052FF] to-[#00C2FF] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResolving ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Resolving name...
                            </span>
                        ) : isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Loading...
                            </span>
                        ) : (
                            'View Year Wrapped'
                        )}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
                </div>

                {/* Features Preview */}
                <div className="mt-16 grid grid-cols-3 gap-6 text-center max-w-lg">
                    <div className="space-y-2">
                        <div className="text-2xl">📊</div>
                        <div className="text-sm text-white/50">Transaction Stats</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-2xl">⛽</div>
                        <div className="text-sm text-white/50">Gas Savings</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-2xl">🏆</div>
                        <div className="text-sm text-white/50">Your Tribe</div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-4 text-center text-white/30 text-sm border-t border-white/5">
                Data from January 1, 2025 to present
            </footer>
        </div>
    );
}
