// Tribe determination logic and helper functions for Base Year Wrapped

import { WrappedData, Tribe, TRIBE_INFO, TribeInfo } from '@/types/wrapped';

interface TribeScores {
    'DeFi Degen': number;
    'NFT Collector': number;
    'Yield Farmer': number;
    'Social Butterfly': number;
    'Builder': number;
    'OG': number;
    'Whale': number;
    'Explorer': number;
}

export function determineTribe(data: Partial<WrappedData>): { tribe: Tribe; tribeInfo: TribeInfo } {
    const scores: TribeScores = {
        'DeFi Degen': 0,
        'NFT Collector': 0,
        'Yield Farmer': 0,
        'Social Butterfly': 0,
        'Builder': 0,
        'OG': 0,
        'Whale': 0,
        'Explorer': 0,
    };

    // DeFi Degen: High swap volume
    if (data.totalSwapVolumeUSD) {
        if (data.totalSwapVolumeUSD > 100000) scores['DeFi Degen'] += 100;
        else if (data.totalSwapVolumeUSD > 50000) scores['DeFi Degen'] += 80;
        else if (data.totalSwapVolumeUSD > 10000) scores['DeFi Degen'] += 60;
        else if (data.totalSwapVolumeUSD > 1000) scores['DeFi Degen'] += 40;
    }

    // NFT Collector: High NFT activity
    const totalNfts = (data.nftsMinted || 0) + (data.nftsReceived || 0);
    if (totalNfts > 50) scores['NFT Collector'] += 100;
    else if (totalNfts > 20) scores['NFT Collector'] += 80;
    else if (totalNfts > 10) scores['NFT Collector'] += 60;
    else if (totalNfts > 5) scores['NFT Collector'] += 40;

    // Whale: High total volume
    if (data.totalVolumeUSD) {
        if (data.totalVolumeUSD > 500000) scores['Whale'] += 100;
        else if (data.totalVolumeUSD > 100000) scores['Whale'] += 80;
        else if (data.totalVolumeUSD > 50000) scores['Whale'] += 60;
    }

    // OG: Early adopter
    if (data.isOG) {
        scores['OG'] += 90;
    } else if (data.is2025OG) {
        scores['OG'] += 50;
    }

    // Explorer: Protocol diversity
    if (data.uniqueProtocolsUsed) {
        if (data.uniqueProtocolsUsed >= 5) scores['Explorer'] += 100;
        else if (data.uniqueProtocolsUsed >= 3) scores['Explorer'] += 70;
    }

    // === NEW: Builder Scoring ===
    // Detect deployed contracts (transactions where to is null/empty)
    if (data.contractsDeployed) {
        if (data.contractsDeployed >= 10) scores['Builder'] += 100;
        else if (data.contractsDeployed >= 5) scores['Builder'] += 80;
        else if (data.contractsDeployed >= 2) scores['Builder'] += 60;
        else if (data.contractsDeployed >= 1) scores['Builder'] += 40;
    }

    // === NEW: Yield Farmer Scoring ===
    // Based on interactions with lending, staking, and LP protocols
    if (data.defiInteractions) {
        if (data.defiInteractions >= 50) scores['Yield Farmer'] += 100;
        else if (data.defiInteractions >= 20) scores['Yield Farmer'] += 80;
        else if (data.defiInteractions >= 10) scores['Yield Farmer'] += 60;
        else if (data.defiInteractions >= 5) scores['Yield Farmer'] += 40;
    }

    // === NEW: Social Butterfly Scoring ===
    // Based on Farcaster activity - having account, followers, casts, tips
    if (data.hasFarcaster) {
        scores['Social Butterfly'] += 30; // Base points for having Farcaster

        // Follower count bonus
        if (data.farcasterFollowers) {
            if (data.farcasterFollowers >= 1000) scores['Social Butterfly'] += 50;
            else if (data.farcasterFollowers >= 500) scores['Social Butterfly'] += 40;
            else if (data.farcasterFollowers >= 100) scores['Social Butterfly'] += 30;
            else if (data.farcasterFollowers >= 10) scores['Social Butterfly'] += 15;
        }

        // Activity (casts) bonus  
        if (data.farcasterCasts) {
            if (data.farcasterCasts >= 500) scores['Social Butterfly'] += 30;
            else if (data.farcasterCasts >= 100) scores['Social Butterfly'] += 20;
            else if (data.farcasterCasts >= 20) scores['Social Butterfly'] += 10;
        }
    }

    // Tip activity (social payments)
    const totalTips = (data.farcasterTipsSent || 0) + (data.farcasterTipsReceived || 0);
    if (totalTips > 50) scores['Social Butterfly'] += 20;
    else if (totalTips > 10) scores['Social Butterfly'] += 10;

    // Activity bonus
    if (data.uniqueDaysActive) {
        if (data.uniqueDaysActive > 100) {
            scores['DeFi Degen'] += 20;
            scores['Explorer'] += 20;
        }
    }

    // Streak bonus
    if (data.longestStreak && data.longestStreak > 7) {
        scores['DeFi Degen'] += 15;
    }

    // Find highest scoring tribe
    const sortedTribes = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const topTribe = sortedTribes[0][1] > 0 ? sortedTribes[0][0] as Tribe : 'Explorer';

    return {
        tribe: topTribe,
        tribeInfo: TRIBE_INFO[topTribe],
    };
}

// Generate fun equivalents for gas saved
export function getGasSavedEquivalent(gasSavedUSD: number): string {
    if (gasSavedUSD < 5) return `${gasSavedUSD.toFixed(0)} gumballs 🍬`;
    if (gasSavedUSD < 20) return `${Math.floor(gasSavedUSD / 5)} coffees ☕`;
    if (gasSavedUSD < 100) return `${Math.floor(gasSavedUSD / 15)} pizzas 🍕`;
    if (gasSavedUSD < 500) return `${Math.floor(gasSavedUSD / 50)} concert tickets 🎫`;
    if (gasSavedUSD < 2000) return `${Math.floor(gasSavedUSD / 300)} flights ✈️`;
    return `${Math.floor(gasSavedUSD / 1000)} vacations 🏝️`;
}

// Get month name from date
export function getMostActiveMonth(transactions: { timeStamp: string }[]): string {
    if (!transactions.length) return 'N/A';

    const monthCounts: Record<string, number> = {};
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    transactions.forEach(tx => {
        const date = new Date(Number(tx.timeStamp) * 1000);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    const sortedMonths = Object.entries(monthCounts).sort(([, a], [, b]) => b - a);
    if (!sortedMonths.length) return 'N/A';

    const monthIndex = parseInt(sortedMonths[0][0].split('-')[1]);
    return monthNames[monthIndex];
}

// Get most active day of week
export function getMostActiveDay(transactions: { timeStamp: string }[]): string {
    if (!transactions.length) return 'N/A';

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts: Record<number, number> = {};

    transactions.forEach(tx => {
        const date = new Date(Number(tx.timeStamp) * 1000);
        const day = date.getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const sortedDays = Object.entries(dayCounts).sort(([, a], [, b]) => b - a);
    if (!sortedDays.length) return 'N/A';

    return dayNames[parseInt(sortedDays[0][0])];
}

// Determine preferred time of day
export function getPreferredTimeOfDay(transactions: { timeStamp: string }[]): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (!transactions.length) return 'afternoon';

    const timeCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    transactions.forEach(tx => {
        const date = new Date(Number(tx.timeStamp) * 1000);
        const hour = date.getHours();

        if (hour >= 5 && hour < 12) timeCounts.morning++;
        else if (hour >= 12 && hour < 17) timeCounts.afternoon++;
        else if (hour >= 17 && hour < 21) timeCounts.evening++;
        else timeCounts.night++;
    });

    return Object.entries(timeCounts).sort(([, a], [, b]) => b - a)[0][0] as 'morning' | 'afternoon' | 'evening' | 'night';
}

// Calculate longest streak of consecutive days
export function getLongestStreak(transactions: { timeStamp: string }[]): number {
    if (!transactions.length) return 0;

    const uniqueDays = new Set<string>();
    transactions.forEach(tx => {
        const date = new Date(Number(tx.timeStamp) * 1000);
        uniqueDays.add(date.toISOString().split('T')[0]);
    });

    const sortedDays = Array.from(uniqueDays).sort();
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
        const prevDate = new Date(sortedDays[i - 1]);
        const currDate = new Date(sortedDays[i]);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    return maxStreak;
}

// Calculate current active streak (ending today)
export function getCurrentStreak(transactions: { timeStamp: string }[]): number {
    if (!transactions.length) return 0;

    const uniqueDays = new Set<string>();
    transactions.forEach(tx => {
        const date = new Date(Number(tx.timeStamp) * 1000);
        uniqueDays.add(date.toISOString().split('T')[0]);
    });

    const sortedDays = Array.from(uniqueDays).sort().reverse();
    const today = new Date().toISOString().split('T')[0];

    // Check if there's activity today or yesterday
    if (sortedDays[0] !== today && sortedDays[0] !== new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
        return 0; // No recent activity
    }

    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
        const prevDate = new Date(sortedDays[i - 1]);
        const currDate = new Date(sortedDays[i]);
        const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}
