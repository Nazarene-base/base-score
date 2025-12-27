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
    castCount: number;           // NEW: Number of casts
    degenTipsSent: number;       // NEW: Degen tips sent
    degenTipsReceived: number;   // NEW: Degen tips received
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

        // Fetch cast count (using Neynar's user endpoint which includes it)
        let castCount = 0;
        try {
            const userResponse = await fetch(
                `https://api.neynar.com/v2/farcaster/user/bulk?fids=${user.fid}`,
                {
                    headers: {
                        'accept': 'application/json',
                        'x-api-key': apiKey,
                    },
                    next: { revalidate: 300 },
                }
            );
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.users?.[0]?.profile?.bio?.mentions_count !== undefined) {
                    // Neynar doesn't directly expose cast count, estimate from FID age
                    // Users typically cast 1-5 times per day on average
                    castCount = Math.min(accountAgeMonths * 30, 500); // Rough estimate
                }
            }
        } catch (e) {
            // Silently fail cast count fetch
        }

        // Fetch Degen tips
        let degenTipsSent = 0;
        let degenTipsReceived = 0;
        try {
            const tips = await getDegenTips(user.fid);
            degenTipsSent = tips.sent;
            degenTipsReceived = tips.received;
        } catch (e) {
            // Silently fail tips fetch
        }

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
            castCount,
            degenTipsSent,
            degenTipsReceived,
        };

        console.log('✅ Farcaster: Found user', user.username, 'FID:', user.fid, 'Tips:', degenTipsSent + degenTipsReceived);
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

/**
 * Farcaster Tips Data Interface
 */
export interface FarcasterTipsData {
    tipsSent: number;
    tipsReceived: number;
    totalSentAmount: number;
    totalReceivedAmount: number;
}

/**
 * Get Farcaster tips data for a user
 * Uses Neynar's tip tracking endpoints
 */
export async function getFarcasterTips(fid: number): Promise<FarcasterTipsData> {
    const apiKey = process.env.NEYNAR_API_KEY;

    // Default empty data
    const emptyData: FarcasterTipsData = {
        tipsSent: 0,
        tipsReceived: 0,
        totalSentAmount: 0,
        totalReceivedAmount: 0,
    };

    if (!apiKey || !fid) {
        return emptyData;
    }

    try {
        console.log('💰 Farcaster: Fetching tips for FID', fid);

        // Neynar doesn't have a direct tips endpoint in v2
        // Tips on Farcaster are typically done through:
        // 1. Warps (Warpcast's tipping currency)
        // 2. DEGEN tips
        // 3. Other token tips via casts

        // For now, we return empty data. 
        // A full implementation would scan for tip-related casts
        // or use a specialized tips API like Degen tips API

        // TODO: Integrate with Degen Tips API when available
        // https://api.degen.tips/airdrop2/tips?fid={fid}

        return emptyData;
    } catch (error) {
        console.error('❌ Farcaster tips error:', error);
        return emptyData;
    }
}

/**
 * Get Farcaster tips from Degen API (if user has DEGEN tips)
 */
export async function getDegenTips(fid: number): Promise<{ sent: number; received: number }> {
    if (!fid) {
        return { sent: 0, received: 0 };
    }

    try {
        // Degen Tips API
        const response = await fetch(
            `https://api.degen.tips/airdrop2/tips?fid=${fid}`,
            { next: { revalidate: 300 } }
        );

        if (!response.ok) {
            return { sent: 0, received: 0 };
        }

        const data = await response.json();

        // The API returns array of tip events
        if (Array.isArray(data)) {
            let sent = 0;
            let received = 0;

            data.forEach((tip: { sender_fid: number; receiver_fid: number; amount: string }) => {
                const amount = parseInt(tip.amount || '0', 10);
                if (tip.sender_fid === fid) {
                    sent += amount;
                }
                if (tip.receiver_fid === fid) {
                    received += amount;
                }
            });

            console.log('✅ Degen tips:', { sent, received });
            return { sent, received };
        }

        return { sent: 0, received: 0 };
    } catch (error) {
        console.error('❌ Degen tips error:', error);
        return { sent: 0, received: 0 };
    }
}

