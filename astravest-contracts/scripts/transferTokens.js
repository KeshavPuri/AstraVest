// scripts/transferTokens.js
const hre = require("hardhat");
// We removed the failing 'require' line

async function main() {
  // --- CONFIGURATION ---
  const recipientAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
  const amountToSend = hre.ethers.utils.parseEther("10000");
  // Paste your staking token address directly here
  const tokenContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  // --- END CONFIGURATION ---
  //...
  // --- END CONFIGURATION ---

  if (!recipientAddress || !tokenContractAddress) {
    throw new Error("Please configure the recipient and token addresses in the script.");
  }

  console.log(`Fetching the StakingToken contract at address: ${tokenContractAddress}`);
  const StakingToken = await hre.ethers.getContractFactory("StakingToken");
  const stakingToken = StakingToken.attach(tokenContractAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  const deployerBalance = await stakingToken.balanceOf(deployer.address);

  console.log(`Deployer account (${deployer.address}) has a balance of ${hre.ethers.utils.formatEther(deployerBalance)} $ASTR`);
  
  if (deployerBalance.lt(amountToSend)) {
      throw new Error("Deployer account does not have enough tokens to send.");
  }

  console.log(`Transferring ${hre.ethers.utils.formatEther(amountToSend)} $ASTR to ${recipientAddress}...`);
  const tx = await stakingToken.transfer(recipientAddress, amountToSend);
  await tx.wait();

  const recipientBalance = await stakingToken.balanceOf(recipientAddress);
  console.log(`✅ Success!`);
  console.log(`Account ${recipientAddress} now has a balance of ${hre.ethers.utils.formatEther(recipientBalance)} $ASTR.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});