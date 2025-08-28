// components/web3/StakeForm.jsx
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/contexts/Web3Context";
import { getAstraVestContract, getStakingTokenContract } from "@/lib/contract";
import { ASTRAVEST_CONTRACT_ADDRESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const StakeForm = ({ onSuccess }) => {
    const [amount, setAmount] = useState("");
    const [isStaking, setIsStaking] = useState(false);
    const { signer } = useWeb3();

    const handleStake = async () => {
        if (!signer || !amount || parseFloat(amount) <= 0) {
            toast.error("Please connect your wallet and enter a valid amount.");
            return;
        }

        setIsStaking(true);
        const amountInWei = ethers.utils.parseEther(amount);
        const stakePromise = new Promise(async (resolve, reject) => {
            try {
                const tokenContract = getStakingTokenContract(signer);
                const astraVestContract = getAstraVestContract(signer);

                // Step 1: Approve the AstraVest contract to spend tokens
                console.log("Approving token spend...");
                const approveTx = await tokenContract.approve(ASTRAVEST_CONTRACT_ADDRESS, amountInWei);
                await approveTx.wait(); // Wait for the transaction to be mined
                console.log("Approval successful!");

                // Step 2: Stake the tokens
                console.log("Staking tokens...");
                const stakeTx = await astraVestContract.stake(0, amountInWei); // Staking in Pool 0
                await stakeTx.wait(); // Wait for the transaction to be mined
                console.log("Staking successful!");

                setAmount("");
                onSuccess(); // Refresh dashboard data
                resolve("Staking successful!");

            } catch (error) {
                console.error("Staking failed:", error);
                reject(error.reason || "An error occurred during staking.");
            }
        });
        
        toast.promise(stakePromise, {
            loading: 'Processing stake transaction... This may take a moment.',
            success: (message) => message,
            error: (err) => `Error: ${err}`,
        });
        
        setIsStaking(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                disabled={isStaking}
            />
            <Button
                onClick={handleStake}
                disabled={isStaking || !amount}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
                {isStaking ? "Staking..." : "Stake $ASTR"}
            </Button>
        </div>
    );
};

export default StakeForm;