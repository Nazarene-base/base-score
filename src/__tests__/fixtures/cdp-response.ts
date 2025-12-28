// Test fixtures - sample CDP API responses for various formats
// These represent real-world API response variations

export const cdpResponseDirect = [
    {
        transaction_hash: '0x123abc',
        block_timestamp: '2025-01-15T12:00:00Z',
        from_address: '0xsender',
        to_address: '0xrecipient',
        value: '1000000000000000000',
        gas_used: '21000',
        gas_price: '1000000000',
    },
    {
        transaction_hash: '0x456def',
        block_timestamp: '2025-02-20T08:30:00Z',
        from_address: '0xsender',
        to_address: '0xrecipient2',
        value: '500000000000000000',
        gas_used: '45000',
        gas_price: '2000000000',
    },
];

export const cdpResponseWrappedTransactions = {
    transactions: [
        {
            transaction_id: '0x789ghi',
            block_timestamp: 1737100800, // Unix seconds
            from_address: '0xsender',
            to_address: '0xrecipient',
            value: '2000000000000000000',
        },
    ],
};

export const cdpResponseWrappedData = {
    data: [
        {
            hash: '0xabc123',
            timestamp: '1737187200', // Unix seconds as string
            from: '0xsender',
            to: '0xrecipient',
            value: '100000000000000000',
        },
    ],
};

export const cdpResponseNestedData = {
    data: {
        transactions: [
            {
                transaction_hash: '0xnested',
                block_timestamp: 1737273600000, // Unix milliseconds
                from_address: '0xsender',
                to_address: '0xrecipient',
                value: '300000000000000000',
            },
        ],
    },
};

export const cdpResponseEmpty = {
    transactions: [],
};

export const cdpResponseNull = null;

export const cdpResponseMalformed = {
    unexpected: 'structure',
    wrongField: 123,
};

// Pre-2025 transaction (should be filtered out)
export const cdpResponse2024 = [
    {
        transaction_hash: '0xold',
        block_timestamp: '2024-06-15T12:00:00Z',
        from_address: '0xsender',
        to_address: '0xrecipient',
        value: '1000000000000000000',
    },
];

// Mixed years
export const cdpResponseMixedYears = [
    {
        transaction_hash: '0x2024tx',
        block_timestamp: '2024-12-01T00:00:00Z',
        from_address: '0xsender',
        to_address: '0xrecipient',
        value: '1000000000000000000',
    },
    {
        transaction_hash: '0x2025tx',
        block_timestamp: '2025-03-01T00:00:00Z',
        from_address: '0xsender',
        to_address: '0xrecipient',
        value: '2000000000000000000',
    },
];
