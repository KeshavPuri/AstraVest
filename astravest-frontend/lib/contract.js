// lib/contract.js
// lib/contract.js
import { ethers } from "ethers";
import { ASTRAVEST_CONTRACT_ADDRESS, STAKING_TOKEN_ADDRESS } from "./constants"; // Import new address
import AstraVestABI from "../contracts/AstraVest.json";
import StakingTokenABI from "../contracts/StakingToken.json"; // 1. Import Token ABI

export const getAstraVestContract = (signerOrProvider) => {
    return new ethers.Contract(
        ASTRAVEST_CONTRACT_ADDRESS,
        AstraVestABI.abi,
        signerOrProvider
    );
};

// 2. Add this new function for the token contract
export const getStakingTokenContract = (signerOrProvider) => {
    return new ethers.Contract(
        STAKING_TOKEN_ADDRESS,
        StakingTokenABI.abi,
        signerOrProvider
    );
};