// components/web3/UnstakeClaimForm.jsx
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/contexts/Web3Context";
import { getAstraVestContract } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const UnstakeClaimForm = ({ onSuccess }) => {
    const { signer, address } = useWeb3();
    const [unstakeAmount, setUnstakeAmount] = useState("");
    const [claimableRewards, setClaimableRewards] = useState("0.00");
    const [isProcessing, setIsProcessing] = useState(false);

    // Effect to fetch claimable rewards
    useEffect(() => {
        const fetchClaimable = async () => {
            if (!signer || !address) return;
            try {
                const contract = getAstraVestContract(signer);
                const rewards = await contract.calculateClaimableRewards(address);
                setClaimableRewards(parseFloat(ethers.utils.formatEther(rewards)).toFixed(4));
            } catch (error) {
                console.error("Could not fetch claimable rewards:", error);
            }
        };

        const interval = setInterval(() => {
            fetchClaimable();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [signer, address]);

    const handleUnstake = async () => {
        if (!signer || !unstakeAmount || parseFloat(unstakeAmount) <= 0) {
            toast.error("Please enter a valid amount to unstake.");
            return;
        }

        setIsProcessing(true);
        const amountInWei = ethers.utils.parseEther(unstakeAmount);

        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    const contract = getAstraVestContract(signer);
                    const tx = await contract.unstake(0, amountInWei);
                    await tx.wait();
                    setUnstakeAmount("");
                    onSuccess(); // Refresh dashboard data
                    resolve("Unstake successful!");
                } catch (error) {
                    console.error("Unstake failed:", error);
                    reject(error.reason || "An error occurred during unstake.");
                }
            }),
            {
                loading: "Processing unstake transaction...",
                success: (message) => message,
                error: (err) => `Error: ${err}`,
            }
        );
        setIsProcessing(false);
    };

    const handleClaim = async () => {
        if (!signer || parseFloat(claimableRewards) <= 0) {
            toast.error("No claimable rewards available.");
            return;
        }
        
        setIsProcessing(true);
        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    const contract = getAstraVestContract(signer);
                    const tx = await contract.claimVestedRewards();
                    await tx.wait();
                    onSuccess(); // Refresh dashboard data
                    resolve("Rewards claimed successfully!");
                } catch (error) {
                    console.error("Claim failed:", error);
                    reject(error.reason || "An error occurred while claiming.");
                }
            }),
            {
                loading: "Processing claim transaction...",
                success: (message) => message,
                error: (err) => `Error: ${err}`,
            }
        );
        setIsProcessing(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Claimable Rewards</p>
                <p className="text-2xl font-bold text-purple-400">{claimableRewards} $ASTR</p>
            </div>
            <Button
                onClick={handleClaim}
                disabled={isProcessing || parseFloat(claimableRewards) <= 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            >
                {isProcessing ? "Processing..." : "Claim Rewards"}
            </Button>
            <div className="flex flex-col gap-4 border-t border-gray-700 pt-6">
                 <Input
                    type="number"
                    placeholder="0.0"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    disabled={isProcessing}
                />
                <Button
                    onClick={handleUnstake}
                    disabled={isProcessing || !unstakeAmount}
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-900 hover:text-white font-bold"
                >
                    {isProcessing ? "Processing..." : "Unstake"}
                </Button>
            </div>
        </div>
    );
};

export default UnstakeClaimForm;