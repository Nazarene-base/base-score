'use server';

/**
 * Farcaster Server Action
 * Keeps Neynar API key server-side for security
 */

// Types for Neynar API response
interface FarcasterUser {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    follower_count: number;
    following_count: number;
    active_status: 'active' | 'inactive';
    power_badge: boolean;
}

export interface FarcasterData {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    followerCount: number;
    followingCount: number;
    accountAge: number;
    hasPowerBadge: boolean;
    isActive: boolean;
}

const NEYNAR_API_URL = 'https://api.neynar.com/v2/farcaster/user/bulk-by-address';

/**
 * Server action to fetch Farcaster user data
 * API key is kept server-side, never exposed to browser
 */
export async function getFarcasterData(address: string): Promise<FarcasterData | null> {
    const apiKey = process.env.NEYNAR_API_KEY; // NOT public!

    if (!apiKey) {
        console.log('ℹ️ Farcaster: No API key configured');
        return null;
    }

    if (!address) return null;

    const normalizedAddress = address.toLowerCase();

    try {
        console.log('🟣 Farcaster: Fetching data for', normalizedAddress.slice(0, 10));

        const response = await fetch(
            `${NEYNAR_API_URL}?addresses=${normalizedAddress}`,
            {
                headers: {
                    'accept': 'application/json',
                    'x-api-key': apiKey,
                },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            console.error('❌ Farcaster API error:', response.status);
            return null;
        }

        const data = await response.json();
        const users = data[normalizedAddress] || [];

        if (users.length === 0) {
            console.log('ℹ️ Farcaster: No user found for address');
            return null;
        }

        const user: FarcasterUser = users[0];
        const accountAgeMonths = estimateAccountAge(user.fid);

        const farcasterData: FarcasterData = {
            fid: user.fid,
            username: user.username,
            displayName: user.display_name,
            pfpUrl: user.pfp_url,
            followerCount: user.follower_count,
            followingCount: user.following_count,
            accountAge: accountAgeMonths,
            hasPowerBadge: user.power_badge,
            isActive: user.active_status === 'active',
        };

        console.log('✅ Farcaster: Found user', user.username, 'FID:', user.fid);
        return farcasterData;
    } catch (error) {
        console.error('❌ Farcaster: Fetch error', error);
        return null;
    }
}

/**
 * Estimate account age in months based on FID
 */
function estimateAccountAge(fid: number): number {
    const now = new Date();
    const currentMonth = now.getFullYear() * 12 + now.getMonth();

    let registrationMonth: number;

    if (fid <= 1000) {
        registrationMonth = 2022 * 12 + 6; // June 2022
    } else if (fid <= 10000) {
        registrationMonth = 2022 * 12 + 12; // Dec 2022
    } else if (fid <= 50000) {
        registrationMonth = 2023 * 12 + 3; // March 2023
    } else if (fid <= 200000) {
        registrationMonth = 2023 * 12 + 8; // Aug 2023
    } else if (fid <= 500000) {
        registrationMonth = 2024 * 12 + 1; // Jan 2024
    } else if (fid <= 800000) {
        registrationMonth = 2024 * 12 + 6; // June 2024
    } else {
        registrationMonth = 2024 * 12 + 10; // Oct 2024
    }

    return Math.max(0, currentMonth - registrationMonth);
}
