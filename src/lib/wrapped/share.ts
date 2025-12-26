// Share Image Generation for Base Year Wrapped
// Generates shareable images from wrapped data

import { WrappedData } from '@/types/wrapped';

/**
 * Generate share text for social media
 */
export function generateShareText(data: WrappedData): string {
    const lines = [
        `🔵 My Base Year Wrapped 2025`,
        ``,
        `${data.tribeInfo.icon} I'm a ${data.tribe}!`,
        ``,
        `📊 ${data.totalTransactions.toLocaleString()} transactions`,
        `📅 ${data.uniqueDaysActive} days active`,
        `🔗 ${data.uniqueProtocolsUsed} protocols used`,
        `⛽ ${formatUSD(data.gasSavedVsL1USD)} saved vs L1`,
    ];

    if (data.longestStreak >= 7) {
        lines.push(`🔥 ${data.longestStreak}-day streak`);
    }

    if (data.nftsMinted > 0) {
        lines.push(`🖼️ ${data.nftsMinted} NFTs minted`);
    }

    lines.push(``, `Check your #BaseWrapped at basescore.xyz/wrapped`);

    return lines.join('\n');
}

/**
 * Generate Twitter/X share URL
 */
export function getTwitterShareUrl(data: WrappedData): string {
    const text = generateShareText(data);
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

/**
 * Generate Warpcast (Farcaster) share URL
 */
export function getWarpcastShareUrl(data: WrappedData): string {
    const text = generateShareText(data);
    // Warpcast compose URL with pre-filled text
    return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
}

/**
 * Format USD for display
 */
function formatUSD(amount: number): string {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
}

/**
 * Generate SVG share card (can be converted to PNG)
 */
export function generateShareSVG(data: WrappedData): string {
    const width = 1200;
    const height = 630; // Standard OG image size

    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#050A19"/>
      <stop offset="50%" style="stop-color:#0A1628"/>
      <stop offset="100%" style="stop-color:#050A19"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0052FF"/>
      <stop offset="100%" style="stop-color:#00FFA3"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="150" fill="#0052FF" opacity="0.1"/>
  <circle cx="${width - 100}" cy="${height - 100}" r="200" fill="#00FFA3" opacity="0.1"/>
  
  <!-- Header -->
  <text x="60" y="80" font-family="Arial, sans-serif" font-size="24" fill="white" opacity="0.6">
    Base Year Wrapped 2025
  </text>
  
  <!-- Tribe icon and name -->
  <text x="60" y="180" font-family="Arial, sans-serif" font-size="80">
    ${data.tribeInfo.icon}
  </text>
  <text x="170" y="180" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${data.tribeInfo.color}">
    ${data.tribe}
  </text>
  
  <!-- Stats row 1 -->
  <text x="60" y="280" font-family="Arial, sans-serif" font-size="36" fill="white">
    📊 ${data.totalTransactions.toLocaleString()} transactions
  </text>
  <text x="${width / 2 + 60}" y="280" font-family="Arial, sans-serif" font-size="36" fill="white">
    📅 ${data.uniqueDaysActive} days active
  </text>
  
  <!-- Stats row 2 -->
  <text x="60" y="360" font-family="Arial, sans-serif" font-size="36" fill="white">
    🔗 ${data.uniqueProtocolsUsed} protocols
  </text>
  <text x="${width / 2 + 60}" y="360" font-family="Arial, sans-serif" font-size="36" fill="white">
    ⛽ ${formatUSD(data.gasSavedVsL1USD)} saved
  </text>
  
  <!-- Stats row 3 -->
  <text x="60" y="440" font-family="Arial, sans-serif" font-size="36" fill="white">
    🔥 ${data.longestStreak}-day streak
  </text>
  <text x="${width / 2 + 60}" y="440" font-family="Arial, sans-serif" font-size="36" fill="white">
    💰 ${formatUSD(data.totalVolumeUSD)} volume
  </text>
  
  <!-- Footer -->
  <rect x="0" y="${height - 80}" width="${width}" height="80" fill="url(#accent)" opacity="0.2"/>
  <text x="${width / 2}" y="${height - 30}" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
    basescore.xyz/wrapped
  </text>
  
  <!-- Wallet address -->
  ${data.basenameName ? `
    <text x="${width - 60}" y="80" font-family="Arial, sans-serif" font-size="20" fill="#00FFA3" text-anchor="end">
      ${data.basenameName}
    </text>
  ` : `
    <text x="${width - 60}" y="80" font-family="monospace" font-size="16" fill="white" opacity="0.6" text-anchor="end">
      ${data.walletAddress.slice(0, 6)}...${data.walletAddress.slice(-4)}
    </text>
  `}
</svg>
  `.trim();
}

/**
 * Download wrapped data as JSON (for backup/verification)
 */
export function downloadWrappedJSON(data: WrappedData): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base-wrapped-2025-${data.walletAddress.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Copy share text to clipboard
 */
export async function copyShareText(data: WrappedData): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(generateShareText(data));
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}
