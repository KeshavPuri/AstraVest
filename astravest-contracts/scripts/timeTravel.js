// scripts/timeTravel.js
const hre = require("hardhat");

async function main() {
  // 8 mahine in seconds (approximate)
  const EIGHT_MONTHS_IN_SECONDS = 8 * 30 * 24 * 60 * 60; 
  
  console.log("Initiating time travel...");
  
  // Hardhat network ko time aage badhane ka command bhej rahe hain
  await hre.network.provider.send("evm_increaseTime", [EIGHT_MONTHS_IN_SECONDS]);
  
  // Ek naya block mine kar rahe hain taaki time change लागू ho
  await hre.network.provider.send("evm_mine"); 
  
  console.log(`🚀 Time travel complete! We have jumped forward by 8 months.`);
  console.log("Refresh your AstraVest dashboard to see the results.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});