// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/contexts/Web3Context";
import { getAstraVestContract } from "@/lib/contract";

import ConnectWalletButton from "@/components/web3/ConnectWalletButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
    const { signer, address } = useWeb3();
    const [stakedBalance, setStakedBalance] = useState("0");
    const [apr, setApr] = useState("0");
    const [totalStaked, setTotalStaked] = useState("0");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContractData = async () => {
            if (!signer || !address) return;

            setIsLoading(true);
            try {
                const contract = getAstraVestContract(signer);
                
                // Fetch data for pool 0
                const poolInfo = await contract.poolInfo(0);
                const userInfo = await contract.userInfo(0, address);

                // Format the BigNumber values to readable strings
                const formattedTotalStaked = ethers.utils.formatEther(poolInfo.totalStaked);
                const formattedStakedBalance = ethers.utils.formatEther(userInfo.amount);
                 // AFTER (Correct)
const formattedApr = (poolInfo.apr.toNumber() / 100).toFixed(2); // e.g., 2000 -> 20.00

                setTotalStaked(formattedTotalStaked);
                setStakedBalance(formattedStakedBalance);
                setApr(formattedApr);

            } catch (error) {
                console.error("Failed to fetch contract data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContractData();
    }, [signer, address]);

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
            <header className="w-full px-8 py-4 flex justify-between items-center border-b border-gray-800">
                <h1 className="text-2xl font-bold text-purple-400">AstraVest Dashboard</h1>
                <ConnectWalletButton />
            </header>

            <main className="flex-1 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DataCard title="Your Staked Balance" value={stakedBalance} unit="$ASTR" isLoading={isLoading} />
                    <DataCard title="Total Pool Balance" value={totalStaked} unit="$ASTR" isLoading={isLoading} />
                    <DataCard title="Current APR" value={apr} unit="%" isLoading={isLoading} />
                </div>
                {/* Staking and Vesting components will go here later */}
            </main>
        </div>
    );
}