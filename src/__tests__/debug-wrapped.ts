// Debug script to test the Year Wrapped data pipeline
// Run with: npx ts-node --skip-project src/__tests__/debug-wrapped.ts

import { getCdpWalletData } from '../app/actions/cdp';
import { mapCdpHistoryToBasescan } from '../lib/cdp-mapping';
import { getTransactions, getTokenTransfers, getNFTTransfers } from '../lib/basescan';

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik

async function debugDataPipeline() {
    console.log('\n=== YEAR WRAPPED DATA PIPELINE DEBUG ===\n');
    console.log('Test address:', TEST_ADDRESS);
    console.log('Current date:', new Date().toISOString());
    console.log('');

    // Step 1: Test CDP API
    console.log('--- STEP 1: CDP API ---');
    try {
        const cdpResult = await getCdpWalletData(TEST_ADDRESS);
        console.log('CDP success:', cdpResult.success);

        if (cdpResult.success && cdpResult.data) {
            console.log('CDP history type:', typeof cdpResult.data.history);
            console.log('CDP history is array:', Array.isArray(cdpResult.data.history));

            if (cdpResult.data.history) {
                const historyRaw = cdpResult.data.history;
                console.log('CDP history keys:', Object.keys(historyRaw));

                // Check nested structures
                if (historyRaw.transactions) {
                    console.log('Found historyRaw.transactions:', historyRaw.transactions.length);
                }
                if (historyRaw.data) {
                    console.log('Found historyRaw.data:', typeof historyRaw.data);
                }
                if (Array.isArray(historyRaw)) {
                    console.log('historyRaw is direct array:', historyRaw.length);
                }
            }

            // Map to Basescan format
            let rawHistoryList: any[] = [];
            const cdpHistoryRaw = cdpResult.data.history;
            if (Array.isArray(cdpHistoryRaw)) {
                rawHistoryList = cdpHistoryRaw;
            } else if (cdpHistoryRaw && typeof cdpHistoryRaw === 'object') {
                rawHistoryList =
                    cdpHistoryRaw.transactions ||
                    cdpHistoryRaw.data ||
                    cdpHistoryRaw.items ||
                    cdpHistoryRaw.results ||
                    [];
            }

            console.log('Raw history list length:', rawHistoryList.length);

            if (rawHistoryList.length > 0) {
                console.log('Sample transaction:', JSON.stringify(rawHistoryList[0], null, 2));
            }

            const mapped = mapCdpHistoryToBasescan(rawHistoryList);
            console.log('Mapped transactions:', mapped.length);

            if (mapped.length > 0) {
                console.log('Sample mapped tx:', JSON.stringify(mapped[0], null, 2));

                // Test 2025 filter
                const YEAR_START = new Date('2025-01-01T00:00:00Z');
                const now = new Date();
                const txs2025 = mapped.filter(tx => {
                    const tsNum = Number(tx.timeStamp);
                    if (isNaN(tsNum) || tsNum <= 0) return false;
                    const date = new Date(tsNum * 1000);
                    return date >= YEAR_START && date <= now;
                });
                console.log('2025 transactions:', txs2025.length);

                if (txs2025.length > 0) {
                    console.log('First 2025 tx date:', new Date(Number(txs2025[0].timeStamp) * 1000).toISOString());
                } else {
                    console.log('⚠️ NO 2025 TRANSACTIONS - checking timestamp range...');
                    const timestamps = mapped.slice(0, 5).map(tx => ({
                        raw: tx.timeStamp,
                        date: new Date(Number(tx.timeStamp) * 1000).toISOString()
                    }));
                    console.log('Sample timestamps:', timestamps);
                }
            }
        } else {
            console.log('CDP error:', cdpResult.error);
        }
    } catch (err) {
        console.error('CDP failed:', err);
    }

    // Step 2: Test Basescan API
    console.log('\n--- STEP 2: BASESCAN API ---');
    try {
        const txResult = await getTransactions(TEST_ADDRESS);
        console.log('Basescan transactions:', txResult.data.length);
        console.log('Is approximate:', txResult.isApproximate);

        if (txResult.data.length > 0) {
            console.log('Sample tx:', {
                hash: txResult.data[0].hash.slice(0, 20),
                timeStamp: txResult.data[0].timeStamp,
                date: new Date(Number(txResult.data[0].timeStamp) * 1000).toISOString()
            });

            // Test 2025 filter
            const YEAR_START = new Date('2025-01-01T00:00:00Z');
            const now = new Date();
            const txs2025 = txResult.data.filter(tx => {
                const tsNum = Number(tx.timeStamp);
                if (isNaN(tsNum) || tsNum <= 0) return false;
                const date = new Date(tsNum * 1000);
                return date >= YEAR_START && date <= now;
            });
            console.log('2025 transactions:', txs2025.length);
        }
    } catch (err) {
        console.error('Basescan transactions failed:', err);
    }

    // Step 3: Test Token Transfers (these work for DEX volume)
    console.log('\n--- STEP 3: TOKEN TRANSFERS ---');
    try {
        const tokenTx = await getTokenTransfers(TEST_ADDRESS);
        console.log('Token transfers:', tokenTx.length);

        if (tokenTx.length > 0) {
            const YEAR_START = new Date('2025-01-01T00:00:00Z');
            const now = new Date();
            const tokens2025 = tokenTx.filter(tx => {
                const tsNum = Number(tx.timeStamp);
                if (isNaN(tsNum) || tsNum <= 0) return false;
                const date = new Date(tsNum * 1000);
                return date >= YEAR_START && date <= now;
            });
            console.log('2025 token transfers:', tokens2025.length);
        }
    } catch (err) {
        console.error('Token transfers failed:', err);
    }

    console.log('\n=== DEBUG COMPLETE ===\n');
}

debugDataPipeline().catch(console.error);
