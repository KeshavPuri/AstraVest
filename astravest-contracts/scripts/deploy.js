const hre = require("hardhat");

async function main() {
  // Get the contract factory for our mock StakingToken
  const StakingToken = await hre.ethers.getContractFactory("StakingToken");
  // Deploy it with an initial supply of 1,000,000 tokens
  const stakingToken = await StakingToken.deploy(hre.ethers.utils.parseEther("1000000"));
  await stakingToken.deployed();
  console.log(`Mock Staking Token ($ASTR) deployed to: ${stakingToken.address}`);

  // Get the contract factory for AstraVest
  const AstraVest = await hre.ethers.getContractFactory("AstraVest");
  // Deploy it, passing the StakingToken's address to the constructor
  const astraVest = await AstraVest.deploy(stakingToken.address);
  await astraVest.deployed();
  console.log(`AstraVest contract deployed to: ${astraVest.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});