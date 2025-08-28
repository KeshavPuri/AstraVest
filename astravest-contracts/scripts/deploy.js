// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const StakingToken = await hre.ethers.getContractFactory("StakingToken");
  const stakingToken = await StakingToken.deploy(hre.ethers.utils.parseEther("1000000"));
  await stakingToken.deployed();
  console.log(`Mock Staking Token ($ASTR) deployed to: ${stakingToken.address}`);

  const AstraVest = await hre.ethers.getContractFactory("AstraVest");
  const astraVest = await AstraVest.deploy(stakingToken.address);
  await astraVest.deployed();
  console.log(`AstraVest contract deployed to: ${astraVest.address}`);

  // --- ADD THIS PART ---
  // Add a default staking pool right after deployment
  console.log("Adding a default staking pool (Pool 0) with 20% APR...");
  // The APR is 2000 for 20.00%
  const tx = await astraVest.addPool(2000); 
  await tx.wait(); // Wait for the transaction to be mined
  console.log("Default pool added successfully!");
  // --- END OF ADDED PART ---
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});