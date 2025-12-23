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

        // CDP uses ISO string for timestamp usually (e.g. "2024-01-01T00:00:00Z")
        // BaseScan uses Unix timestamp in seconds (e.g. "1704067200")
        let timeStamp = '0';
        if (tx.block_timestamp) {
            try {
                const date = new Date(tx.block_timestamp);
                timeStamp = Math.floor(date.getTime() / 1000).toString();
            } catch (e) {
                console.warn('Error parsing CDP timestamp:', tx.block_timestamp);
            }
        } else if (tx.timestamp) {
            // sometimes loosely typed APIs return 'timestamp'
            timeStamp = tx.timestamp;
        }

        return {
            hash,
            from,
            to,
            value,
            input,
            timeStamp,
            // Pass through other fields if needed
            blockNumber: tx.block_number,
            nonce: tx.nonce,
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
