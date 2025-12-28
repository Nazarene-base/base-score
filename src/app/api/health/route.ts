// Health Check API Endpoint
// Returns app status and data source availability

import { NextResponse } from 'next/server';

interface HealthCheckResponse {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    version: string;
    uptime: number;
    dataSources: {
        cdp: 'ok' | 'error' | 'unconfigured';
        basescan: 'ok' | 'error' | 'unconfigured';
        farcaster: 'ok' | 'error' | 'unconfigured';
    };
    environment: string;
}

// Track server start time for uptime
const serverStartTime = Date.now();

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
    const cdpConfigured = !!(process.env.CDP_API_KEY_NAME && process.env.CDP_API_KEY_PRIVATE_KEY);
    const basescanConfigured = !!process.env.BASESCAN_API_KEY;
    const farcasterConfigured = !!process.env.NEYNAR_API_KEY;

    const response: HealthCheckResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: Math.floor((Date.now() - serverStartTime) / 1000),
        dataSources: {
            cdp: cdpConfigured ? 'ok' : 'unconfigured',
            basescan: basescanConfigured ? 'ok' : 'unconfigured',
            farcaster: farcasterConfigured ? 'ok' : 'unconfigured',
        },
        environment: process.env.NODE_ENV || 'development',
    };

    // Determine overall status
    const configuredSources = [cdpConfigured, basescanConfigured].filter(Boolean).length;
    if (configuredSources === 0) {
        response.status = 'error';
    } else if (configuredSources < 2) {
        response.status = 'degraded';
    }

    return NextResponse.json(response, {
        status: response.status === 'error' ? 503 : 200,
        headers: {
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}
