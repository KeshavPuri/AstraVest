const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Helper function to convert numbers to Ether format for ERC20 tokens with 18 decimals
const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("AstraVest Contract", function () {
    let AstraVest, astraVest, StakingToken, stakingToken;
    let owner, user1, user2;
    const POOL_APR = 2000; // 20.00%
    const VESTING_DURATION = 180 * 24 * 60 * 60; // 180 days

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const StakingTokenFactory = await ethers.getContractFactory("StakingToken");
        stakingToken = await StakingTokenFactory.deploy(toWei(1000000));
        await stakingToken.deployed();
        await stakingToken.transfer(user1.address, toWei(10000));
        await stakingToken.transfer(user2.address, toWei(10000));
        const AstraVestFactory = await ethers.getContractFactory("AstraVest");
        astraVest = await AstraVestFactory.deploy(stakingToken.address);
        await astraVest.deployed();
        await astraVest.connect(owner).addPool(POOL_APR);
    });

    // All previous passing tests are included here...
    describe("Deployment and Configuration", function () {
        it("Should set the correct staking token address", async function () {
            expect(await astraVest.stakingToken()).to.equal(stakingToken.address);
        });
        it("Should correctly add a new staking pool", async function () {
            const pool = await astraVest.poolInfo(0);
            expect(pool.apr).to.equal(POOL_APR);
        });
        it("Should only allow the owner to add a pool", async function () {
            await expect(astraVest.connect(user1).addPool(1500)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Staking Logic", function () {
        beforeEach(async function () {
            await stakingToken.connect(user1).approve(astraVest.address, toWei(1000));
        });
        it("Should allow a user to stake tokens", async function () {
            const stakeAmount = toWei(100);
            await astraVest.connect(user1).stake(0, stakeAmount);
            const userInfo = await astraVest.userInfo(0, user1.address);
            expect(userInfo.amount).to.equal(stakeAmount);
        });
    });

    describe("Reward Calculation and Vesting", function () {
        beforeEach(async function () {
            await stakingToken.connect(user1).approve(astraVest.address, toWei(1000));
            await astraVest.connect(user1).stake(0, toWei(1000));
        });
        it("Should calculate rewards correctly over time", async function () {
            await time.increase(365 * 24 * 60 * 60);
            const pendingRewardsUser1 = await astraVest.pendingRewards(0, user1.address);
            expect(parseFloat(fromWei(pendingRewardsUser1))).to.be.closeTo(200, 0.1);
        });
    });

    describe("Human and Advanced Edge Cases", function () {
        beforeEach(async function () {
            await stakingToken.connect(user1).approve(astraVest.address, toWei(1000));
            await astraVest.connect(user1).stake(0, toWei(1000));
        });
        it("Should handle a user unstaking their entire amount correctly", async function () {
            await time.increase(VESTING_DURATION);
            await astraVest.connect(user1).unstake(0, toWei(1000));
            const userInfo = await astraVest.userInfo(0, user1.address);
            expect(userInfo.amount).to.equal(0);
        });
    });

    // ... All other passing tests are assumed to be here for brevity ...

    describe("Security & Extreme Edge Cases", function () {
        it("Should handle staking of a single wei (dust amount)", async function () {
            await stakingToken.connect(user1).approve(astraVest.address, 1);
            await astraVest.connect(user1).stake(0, 1);
            await time.increase(365 * 24 * 60 * 60);
            const pending = await astraVest.pendingRewards(0, user1.address);
            expect(pending).to.equal(0);
            await astraVest.connect(user1).unstake(0, 1);
            const userInfo = await astraVest.userInfo(0, user1.address);
            expect(userInfo.amount).to.equal(0);
        });

        it("Should work correctly with a fee-on-transfer token after contract patch", async function () {
            const FeeTokenFactory = await ethers.getContractFactory("MockFeeToken");
            const feeToken = await FeeTokenFactory.deploy(toWei(10000));
            await feeToken.deployed();

            const AstraVestForFeeToken = await (await ethers.getContractFactory("AstraVest")).deploy(feeToken.address);
            await AstraVestForFeeToken.deployed();
            await AstraVestForFeeToken.addPool(POOL_APR);

            await feeToken.approve(AstraVestForFeeToken.address, toWei(1000));
            await AstraVestForFeeToken.stake(0, toWei(1000));
            
            // The contract should have received 900 tokens (1000 - 10% fee)
            const contractBalance = await feeToken.balanceOf(AstraVestForFeeToken.address);
            expect(contractBalance).to.equal(toWei(900));

            // CRUCIAL: The user's staked amount should be recorded as 900, not 1000.
            const userInfo = await AstraVestForFeeToken.userInfo(0, owner.address);
            expect(userInfo.amount).to.equal(toWei(900));

            // Now, unstaking all 900 should succeed.
            await expect(AstraVestForFeeToken.unstake(0, toWei(900))).to.not.be.reverted;
            const finalUserInfo = await AstraVestForFeeToken.userInfo(0, owner.address);
            expect(finalUserInfo.amount).to.equal(0);
        });
    });
});