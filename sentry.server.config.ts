// Sentry Server Configuration
// Initializes Sentry for server-side error tracking (API routes, SSR)

import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Sampling rate for traces
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Only enabled in production
    enabled: process.env.NODE_ENV === 'production',

    // Debug in development
    debug: process.env.NODE_ENV === 'development',

    // Set environment
    environment: process.env.NODE_ENV,

    // Capture unhandled promise rejections
    integrations: [
        Sentry.captureConsoleIntegration({
            levels: ['error'],
        }),
    ],
});
