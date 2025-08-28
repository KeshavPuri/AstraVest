// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import UnstakeClaimForm from "@/components/web3/UnstakeClaimForm"; 
// ... other imports
import { Toaster } from "@/components/ui/sonner"; // Import Toaster
import StakeForm from "@/components/web3/StakeForm"; // Import StakeForm
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Add CardDescription

import { ethers } from "ethers";

import { getAstraVestContract } from "@/lib/contract";
import ConnectWalletButton from "@/components/web3/ConnectWalletButton"; // <-- ADD THIS LINE

export default function Dashboard() {
    const { signer, address } = useWeb3();
    const [stakedBalance, setStakedBalance] = useState("0");
    const [apr, setApr] = useState("0");
    const [totalStaked, setTotalStaked] = useState("0");
    const [isLoading, setIsLoading] = useState(true);

    const fetchContractData = async () => {
        // Renamed to be callable from outside useEffect
        if (!signer || !address) return;

        setIsLoading(true);
        try {
            const contract = getAstraVestContract(signer);
            const poolInfo = await contract.poolInfo(0);
            const userInfo = await contract.userInfo(0, address);
            
            const formattedTotalStaked = parseFloat(ethers.utils.formatEther(poolInfo.totalStaked)).toFixed(2);
            const formattedStakedBalance = parseFloat(ethers.utils.formatEther(userInfo.amount)).toFixed(2);
            const formattedApr = (poolInfo.apr.toNumber() / 100).toFixed(2);

            setTotalStaked(formattedTotalStaked);
            setStakedBalance(formattedStakedBalance);
            setApr(formattedApr);

        } catch (error) {
            console.error("Failed to fetch contract data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContractData();
    }, [signer, address]);

    // ... DataCard component remains the same ...
    const DataCard = ({ title, value, unit, isLoading }) => (
        <Card className="bg-gray-900 border-purple-800">
            <CardHeader>
                <CardTitle className="text-gray-400">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
                ) : (
                    <p className="text-3xl font-bold text-white">
                        {value} <span className="text-lg text-gray-300">{unit}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Toaster richColors theme="dark" /> {/* Add Toaster here */}
            <header className="w-full px-8 py-4 flex justify-between items-center border-b border-gray-800">
                <h1 className="text-2xl font-bold text-purple-400">AstraVest Dashboard</h1>
                <ConnectWalletButton />
            </header>

            <main className="flex-1 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <DataCard title="Your Staked Balance" value={stakedBalance} unit="$ASTR" isLoading={isLoading} />
                    <DataCard title="Total Pool Balance" value={totalStaked} unit="$ASTR" isLoading={isLoading} />
                    <DataCard title="Current APR" value={apr} unit="%" isLoading={isLoading} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle>Stake Tokens</CardTitle>
                            <CardDescription>Deposit your $ASTR tokens to start earning rewards.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <StakeForm onSuccess={fetchContractData} />
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle>Vesting Schedule</CardTitle>
                             <CardDescription>Your earned rewards will appear here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Card className="bg-gray-900 border-gray-800">
    <CardHeader>
        <CardTitle>Vesting Schedule</CardTitle>
         <CardDescription>Unstake or claim your vested rewards here.</CardDescription>
    </CardHeader>
    <CardContent>
        {/* 3. Replace the placeholder */}
        <UnstakeClaimForm onSuccess={fetchContractData} />
    </CardContent>
</Card>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}