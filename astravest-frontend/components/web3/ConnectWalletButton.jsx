// components/web3/ConnectWalletButton.jsx
"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";

const ConnectWalletButton = () => {
    const { address, connectWallet } = useWeb3();

    const formatAddress = (addr) => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div>
            {address ? (
                <Button variant="outline" className="text-white border-purple-500">
                    {formatAddress(address)}
                </Button>
            ) : (
                <Button onClick={connectWallet} className="bg-purple-600 hover:bg-purple-700 text-white">
                    Connect Wallet
                </Button>
            )}
        </div>
    );
};

export default ConnectWalletButton;