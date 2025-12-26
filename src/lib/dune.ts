// Enhanced Dune Analytics API client for Base Year Wrapped
// Provides real percentile rankings using Dune queries

const DUNE_API_BASE = 'https://api.dune.com/api/v1';

// Pre-built Dune queries for Base wrapped stats
// You can create these queries in Dune and use their IDs
// Example query for user percentile:
// SELECT 
//   address,
//   tx_count,
//   PERCENT_RANK() OVER (ORDER BY tx_count) as percentile_rank,
//   (SELECT COUNT(DISTINCT "from") FROM base.transactions WHERE block_time >= '2025-01-01') as total_users
// FROM (
//   SELECT "from" as address, COUNT(*) as tx_count 
//   FROM base.transactions 
//   WHERE block_time >= '2025-01-01'
//   GROUP BY "from"
// )
// WHERE address = LOWER('{{wallet_address}}')

interface DuneExecuteResponse {
    execution_id: string;
    state: string;
}

interface DuneResultResponse<T> {
    execution_id: string;
    state: 'QUERY_STATE_COMPLETED' | 'QUERY_STATE_EXECUTING' | 'QUERY_STATE_FAILED' | 'QUERY_STATE_PENDING';
    result?: {
        rows: T[];
        metadata?: {
            column_names: string[];
            column_types: string[];
        };
    };
}

interface PercentileRow {
    address: string;
    tx_count: number;
    percentile_rank: number;
    total_users: number;
}

interface EcosystemStatsRow {
    total_users: number;
    avg_transactions: number;
    avg_volume_usd: number;
    total_transactions: number;
    median_transactions: number;
}

/**
 * Get Dune API key from environment
 */
function getDuneApiKey(): string | null {
    const key = process.env.DUNE_API_KEY;
    if (!key || key === 'your_dune_api_key_here') {
        console.log('ℹ️ Dune API key not configured, using estimates');
        return null;
    }
    return key;
}

/**
 * Execute a Dune query and wait for results
 */
async function executeAndWaitForResults<T>(
    queryId: number,
    parameters?: Record<string, string>
): Promise<T[] | null> {
    const apiKey = getDuneApiKey();
    if (!apiKey) return null;

    try {
        console.log('📊 Dune: Executing query', queryId);

        // Execute query
        const executeResponse = await fetch(`${DUNE_API_BASE}/query/${queryId}/execute`, {
            method: 'POST',
            headers: {
                'x-dune-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query_parameters: parameters || {},
                performance: 'medium',
            }),
        });

        if (!executeResponse.ok) {
            const errorText = await executeResponse.text();
            console.error('❌ Dune execute failed:', executeResponse.status, errorText);
            return null;
        }

        const executeData: DuneExecuteResponse = await executeResponse.json();
        const executionId = executeData.execution_id;
        console.log('📊 Dune: Execution started:', executionId);

        // Poll for results (max 30 seconds)
        for (let attempt = 0; attempt < 15; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const statusResponse = await fetch(`${DUNE_API_BASE}/execution/${executionId}/results`, {
                headers: {
                    'x-dune-api-key': apiKey,
                },
            });

            if (!statusResponse.ok) {
                continue;
            }

            const result: DuneResultResponse<T> = await statusResponse.json();

            if (result.state === 'QUERY_STATE_COMPLETED' && result.result) {
                console.log('✅ Dune: Query completed with', result.result.rows.length, 'rows');
                return result.result.rows;
            }

            if (result.state === 'QUERY_STATE_FAILED') {
                console.error('❌ Dune: Query failed');
                return null;
            }

            console.log('⏳ Dune: Query state:', result.state);
        }

        console.warn('⚠️ Dune: Query timed out');
        return null;
    } catch (error) {
        console.error('❌ Dune API error:', error);
        return null;
    }
}

/**
 * Get the latest results from a pre-run query (faster)
 */
async function getLatestResults<T>(queryId: number): Promise<T[] | null> {
    const apiKey = getDuneApiKey();
    if (!apiKey) return null;

    try {
        const response = await fetch(`${DUNE_API_BASE}/query/${queryId}/results`, {
            headers: {
                'x-dune-api-key': apiKey,
            },
        });

        if (!response.ok) {
            return null;
        }

        const data: DuneResultResponse<T> = await response.json();
        if (data.state === 'QUERY_STATE_COMPLETED' && data.result) {
            return data.result.rows;
        }

        return null;
    } catch (error) {
        console.error('❌ Dune get results error:', error);
        return null;
    }
}

/**
 * Get user percentile rank from Dune
 * Falls back to estimation if Dune is unavailable
 */
export async function getUserPercentile(
    walletAddress: string,
    txCount: number
): Promise<number> {
    // Quick estimation for immediate display
    const estimated = estimatePercentile(txCount);

    // Try to get real data from Dune (if configured)
    const apiKey = getDuneApiKey();
    if (!apiKey) {
        return estimated;
    }

    // TODO: Replace with your actual Dune query ID
    // You need to create a query in Dune that calculates percentile
    const PERCENTILE_QUERY_ID = 4440000; // Replace with real ID

    try {
        const results = await executeAndWaitForResults<PercentileRow>(
            PERCENTILE_QUERY_ID,
            { wallet_address: walletAddress.toLowerCase() }
        );

        if (results && results.length > 0) {
            const row = results[0];
            const percentile = Math.round(row.percentile_rank * 100);
            console.log('📊 Real percentile from Dune:', percentile);
            return percentile;
        }
    } catch (error) {
        console.error('Dune percentile error:', error);
    }

    return estimated;
}

/**
 * Get ecosystem-wide stats from Dune
 */
export async function getEcosystemStats(): Promise<{
    totalUsers: number;
    avgTransactions: number;
    medianTransactions: number;
    totalTransactions: number;
}> {
    // Default estimates based on Base ecosystem data
    const defaults = {
        totalUsers: 20000000, // ~20M Base users
        avgTransactions: 35,
        medianTransactions: 12,
        totalTransactions: 700000000,
    };

    const apiKey = getDuneApiKey();
    if (!apiKey) {
        return defaults;
    }

    // TODO: Replace with your actual Dune query ID
    const STATS_QUERY_ID = 4440001; // Replace with real ID

    try {
        const results = await getLatestResults<EcosystemStatsRow>(STATS_QUERY_ID);

        if (results && results.length > 0) {
            const row = results[0];
            return {
                totalUsers: row.total_users,
                avgTransactions: row.avg_transactions,
                medianTransactions: row.median_transactions,
                totalTransactions: row.total_transactions,
            };
        }
    } catch (error) {
        console.error('Dune ecosystem stats error:', error);
    }

    return defaults;
}

/**
 * Estimate percentile based on transaction count
 * Uses approximate distribution of Base users
 * Updated with more accurate 2025 data
 */
export function estimatePercentile(txCount: number): number {
    // Distribution based on typical L2 user activity patterns
    // Higher transaction counts = higher percentile
    if (txCount >= 2000) return 99;
    if (txCount >= 1000) return 98;
    if (txCount >= 500) return 95;
    if (txCount >= 300) return 92;
    if (txCount >= 200) return 90;
    if (txCount >= 150) return 85;
    if (txCount >= 100) return 80;
    if (txCount >= 75) return 75;
    if (txCount >= 50) return 70;
    if (txCount >= 35) return 60;
    if (txCount >= 25) return 50;
    if (txCount >= 15) return 40;
    if (txCount >= 10) return 30;
    if (txCount >= 5) return 20;
    if (txCount >= 2) return 15;
    return 10;
}

/**
 * Get percentile description text
 */
export function getPercentileDescription(percentile: number): string {
    if (percentile >= 99) return "You're in the top 1%! Legendary status.";
    if (percentile >= 95) return "Top 5%! You're a power user.";
    if (percentile >= 90) return "Top 10% - seriously impressive activity.";
    if (percentile >= 80) return "Top 20% - you're more active than most.";
    if (percentile >= 70) return "Above average! Keep building.";
    if (percentile >= 50) return "Right in the middle. Solid foundation.";
    if (percentile >= 30) return "Getting started! Plenty of room to explore.";
    return "Welcome to Base! Your journey begins here.";
}
