// Sentry Client Configuration
// Initializes Sentry for client-side error tracking

import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust sampling rate for production
    // 1.0 = 100% of errors captured, adjust based on volume
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Only send errors in production
    enabled: process.env.NODE_ENV === 'production',

    // Debug mode for development
    debug: process.env.NODE_ENV === 'development',

    // Set environment
    environment: process.env.NODE_ENV,

    // Filter out noisy errors
    ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',
        // Wallet connection noise
        'User rejected the request',
        'User denied account authorization',
        'MetaMask - RPC Error',
    ],

    // Add context to errors
    beforeSend(event, hint) {
        // Don't send errors in development
        if (process.env.NODE_ENV === 'development') {
            return null;
        }

        return event;
    },
});
