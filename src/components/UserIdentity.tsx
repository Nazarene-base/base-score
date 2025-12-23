'use client';

import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';

interface UserIdentityProps {
    className?: string;
    showAddress?: boolean;
}

export function UserIdentity({ className = '', showAddress = false }: UserIdentityProps) {
    const { address, isConnected } = useAccount();

    if (!address || !isConnected) return null;

    return (
        <Identity
            address={address}
            className={`bg-transparent ${className}`}
            schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
        >
            <Avatar className="w-8 h-8 rounded-full" />
            <Name className="text-white font-medium text-sm">
                <Badge className="ml-1" />
            </Name>
            {showAddress && (
                <Address className="text-white/60 text-xs" />
            )}
        </Identity>
    );
}
