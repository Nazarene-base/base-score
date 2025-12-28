// Utilities for mapping CDP API responses to internal data structures

// Interfaces for CDP Data Shapes (Approximate based on API docs)
interface CdpTokenBalance {
    contract_address: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: string; // usually raw integer string
}

interface CdpTransaction {
    transaction_id: string; // hash
    transaction_hash?: string;
    block_timestamp: string; // ISO8601
    block_number: number;
    from_address: string;
    to_address: string;
    value: string; // amount
    input?: string; // data
    status: string;
    transaction_type?: string;
}

// Maps CDP Transaction to BaseScan Transaction format
// BaseScan: { timeStamp, from, to, value, input, hash }
export function mapCdpHistoryToBasescan(cdpTransactions: any[]): any[] {
    if (!Array.isArray(cdpTransactions)) return [];

    return cdpTransactions.map((tx) => {
        // Handle both potential field names just in case
        const hash = tx.transaction_hash || tx.transaction_id || tx.hash;
        const from = tx.from_address || tx.from;
        const to = tx.to_address || tx.to;
        const value = tx.value || '0';
        const input = tx.input || '0x';

        // ROBUST TIMESTAMP PARSING: Handle ISO strings, Unix seconds, Unix milliseconds
        // BaseScan expects Unix timestamp in seconds (e.g. "1704067200")
        let timeStamp = '0';
        const rawTs = tx.block_timestamp || tx.timestamp || tx.time;
        if (rawTs) {
            try {
                // Case 1: Already a numeric string (Unix timestamp)
                if (typeof rawTs === 'string' && /^\d+$/.test(rawTs)) {
                    const numVal = Number(rawTs);
                    // If > 1e12, it's likely milliseconds, convert to seconds
                    if (numVal > 1e12) {
                        timeStamp = Math.floor(numVal / 1000).toString();
                    } else {
                        timeStamp = rawTs;
                    }
                }
                // Case 2: ISO 8601 string (e.g. "2024-01-01T00:00:00Z")
                else if (typeof rawTs === 'string' && rawTs.includes('T')) {
                    const date = new Date(rawTs);
                    if (!isNaN(date.getTime())) {
                        timeStamp = Math.floor(date.getTime() / 1000).toString();
                    }
                }
                // Case 3: Number (could be seconds or milliseconds)
                else if (typeof rawTs === 'number') {
                    if (rawTs > 1e12) {
                        timeStamp = Math.floor(rawTs / 1000).toString();
                    } else {
                        timeStamp = Math.floor(rawTs).toString();
                    }
                }
                // Case 4: Try to parse as Date as fallback
                else {
                    const date = new Date(rawTs);
                    if (!isNaN(date.getTime())) {
                        timeStamp = Math.floor(date.getTime() / 1000).toString();
                    }
                }
            } catch (e) {
                console.warn('[CDP-MAPPING] Error parsing timestamp:', rawTs, e);
            }
        }

        // Safe gas defaults - ensure valid string numbers
        const safeGasUsed = tx.gas_used || tx.gasUsed || tx.gas || '21000';
        const safeGasPrice = tx.gas_price || tx.gasPrice || tx.effectiveGasPrice || '1000000';

        return {
            hash,
            from,
            to,
            value,
            input,
            timeStamp,
            blockNumber: tx.block_number || tx.blockNumber,
            nonce: tx.nonce,
            // Safe gas values with validation
            gasUsed: String(safeGasUsed),
            gasPrice: String(safeGasPrice),
        };
    });
}

// Extract ETH balance from CDP Token Balances response
export function getEthBalanceFromCdp(balances: any[]): number {
    if (!Array.isArray(balances)) return 0;

    // Native ETH usually has no contract address or a specific zero address
    // CDP might label it as 'base-mainnet' asset or similar.
    // Documentation says it returns native tokens too.
    // Let's look for symbol 'ETH' or empty contract address.

    // Check for native ETH
    const eth = balances.find(b =>
        b.symbol === 'ETH' ||
        b.contract_address === '0x0000000000000000000000000000000000000000' ||
        !b.contract_address
    );

    if (eth) {
        // Balance is usually in wei as a string
        try {
            const wei = BigInt(eth.balance);
            // Convert to Eth (float)
            return Number(wei) / 1e18;
        } catch (e) {
            return 0;
        }
    }

    return 0;
}
