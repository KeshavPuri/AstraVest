// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AstraVest is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- State Variables ---

    IERC20 public immutable stakingToken; // The token users will stake (e.g., $ASTR)
    
    // Struct to store information about each user's stake
    struct UserInfo {
        uint256 amount;       // How many tokens the user has staked.
        uint256 rewardDebt;   // Used to calculate rewards accrued since last action.
    }

    // Struct to store information about each staking pool
    struct PoolInfo {
        uint256 apr;              // Annual Percentage Rate (e.g., 2000 for 20.00%)
        uint256 totalStaked;      // Total amount of tokens staked in this pool.
        uint256 accRewardsPerShare; // Accumulated rewards per share, used for reward calculation.
        uint256 lastRewardTime;   // The timestamp of the last reward distribution.
    }

    // Struct for managing the vesting schedule of a user's rewards
    struct VestingSchedule {
        uint256 totalAmount;  // Total rewards to be vested.
        uint256 claimedAmount; // Rewards already claimed.
        uint256 startTime;    // Vesting start timestamp.
        uint256 duration;     // Vesting duration in seconds (e.g., 6 months).
    }

    // --- Mappings ---

    // Mapping from Pool ID => PoolInfo
    PoolInfo[] public poolInfo;
    
    // Mapping from Pool ID => User Address => UserInfo
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    // Mapping from User Address => VestingSchedule
    mapping(address => VestingSchedule) public vestingSchedules;

    // --- Events ---

    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event PoolAdded(uint256 indexed poolId, uint256 apr);

    // --- Constructor ---

    constructor(address _stakingTokenAddress) {
        stakingToken = IERC20(_stakingTokenAddress);
    }

    // --- Core Functions ---

    /**
     * @notice Add a new staking pool. Only owner can call this.
     * @param _apr The APR for the new pool (e.g., 2000 for 20.00%).
     */
    function addPool(uint256 _apr) external onlyOwner {
        poolInfo.push(PoolInfo({
            apr: _apr,
            totalStaked: 0,
            accRewardsPerShare: 0,
            lastRewardTime: block.timestamp
        }));
        emit PoolAdded(poolInfo.length - 1, _apr);
    }
    
    /**
     * @notice Stakes tokens into a specific pool.
     * @param _poolId The ID of the pool to stake in.
     * @param _amount The amount of staking tokens to stake.
     */
    function stake(uint256 _poolId, uint256 _amount) external nonReentrant {
        require(_amount > 0, "AstraVest: Amount must be > 0");
        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];

        // Settle pending rewards before staking more
        _updatePool(_poolId);
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardsPerShare) / 1e18 - user.rewardDebt;
            if (pending > 0) {
                _createOrUpdateVestingSchedule(msg.sender, pending);
            }
        }

       // ... function stake ...
uint256 balanceBefore = stakingToken.balanceOf(address(this));
stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
uint256 balanceAfter = stakingToken.balanceOf(address(this));
uint256 amountReceived = balanceAfter - balanceBefore;

require(amountReceived > 0, "AstraVest: Amount received must be > 0");

// Update user and pool state using the actual amount received
user.amount += amountReceived;
pool.totalStaked += amountReceived;
// ...
    }

    /**
     * @notice Unstakes tokens from a specific pool.
     * @param _poolId The ID of the pool to unstake from.
     * @param _amount The amount of staking tokens to unstake.
     */
    function unstake(uint256 _poolId, uint256 _amount) external nonReentrant {
        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];
        require(user.amount >= _amount, "AstraVest: Not enough staked tokens");

        // Settle pending rewards before unstaking
        _updatePool(_poolId);
        uint256 pending = (user.amount * pool.accRewardsPerShare) / 1e18 - user.rewardDebt;
        if (pending > 0) {
            _createOrUpdateVestingSchedule(msg.sender, pending);
        }

        // Update user and pool state
        user.amount -= _amount;
        pool.totalStaked -= _amount;
        user.rewardDebt = (user.amount * pool.accRewardsPerShare) / 1e18;
        
        // Transfer tokens back to the user
        stakingToken.safeTransfer(msg.sender, _amount);

        emit Unstaked(msg.sender, _poolId, _amount);
    }
    
    /**
     * @notice Claims the vested (unlocked) rewards.
     */
    function claimVestedRewards() external nonReentrant {
        uint256 claimable = calculateClaimableRewards(msg.sender);
        require(claimable > 0, "AstraVest: No rewards to claim");

        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        schedule.claimedAmount += claimable;

        // This assumes the contract holds enough reward tokens.
        // In a real scenario, the reward token might be different from the staking token.
        // For simplicity, we assume rewards are also paid in stakingToken.
        stakingToken.safeTransfer(msg.sender, claimable);

        emit RewardsClaimed(msg.sender, claimable);
    }

    // --- View/Helper Functions ---

    /**
     * @notice Calculates the total claimable (unlocked) rewards for a user.
     * @param _user The address of the user.
     * @return The amount of rewards that can be claimed right now.
     */
    function calculateClaimableRewards(address _user) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[_user];
        if (block.timestamp <= schedule.startTime) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - schedule.startTime;
        if (timeElapsed >= schedule.duration) {
            return schedule.totalAmount - schedule.claimedAmount;
        }

        uint256 vestedAmount = (schedule.totalAmount * timeElapsed) / schedule.duration;
        return vestedAmount - schedule.claimedAmount;
    }
    
    /**
     * @notice Calculates the pending rewards for a user in a specific pool.
     * @param _poolId The ID of the pool.
     * @param _user The address of the user.
     * @return The amount of pending rewards.
     */
    function pendingRewards(uint256 _poolId, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][_user];
        uint256 accRewardsPerShare = pool.accRewardsPerShare;
        
        if (block.timestamp > pool.lastRewardTime && pool.totalStaked != 0) {
            uint256 timeDelta = block.timestamp - pool.lastRewardTime;
           uint256 rewards = (timeDelta * pool.apr * pool.totalStaked) / (365 days * 10000); // APR calculation
            accRewardsPerShare += (rewards * 1e18) / pool.totalStaked;
        }
        
        return (user.amount * accRewardsPerShare) / 1e18 - user.rewardDebt;
    }

    // --- Internal Functions ---

    /**
     * @notice Updates the reward variables for a given pool.
     * @param _poolId The ID of the pool to update.
     */
    function _updatePool(uint256 _poolId) internal {
        PoolInfo storage pool = poolInfo[_poolId];
        if (block.timestamp <= pool.lastRewardTime) {
            return;
        }

        if (pool.totalStaked == 0) {
            pool.lastRewardTime = block.timestamp;
            return;
        }

        uint256 timeDelta = block.timestamp - pool.lastRewardTime;
        // Simple interest (APR) calculation
        // Rewards = Time Passed * APR * Total Staked
        // We divide by (365 days * 100) because APR is in basis points (e.g., 2000 for 20%)
        uint256 rewards = (timeDelta * pool.apr * pool.totalStaked) / (365 days * 10000);
        
        pool.accRewardsPerShare += (rewards * 1e18) / pool.totalStaked;
        pool.lastRewardTime = block.timestamp;
    }

    /**
     * @notice Creates a new vesting schedule or adds rewards to an existing one.
     * @param _user The user for whom to create/update the schedule.
     * @param _amount The amount of rewards to vest.
     */
    function _createOrUpdateVestingSchedule(address _user, uint256 _amount) internal {
    VestingSchedule storage schedule = vestingSchedules[_user];
    
    // The new total is the previously unclaimed amount plus the new rewards.
    schedule.totalAmount = (schedule.totalAmount - schedule.claimedAmount) + _amount;
    schedule.claimedAmount = 0; // Reset claimed amount as the total has changed
    schedule.startTime = block.timestamp;
    schedule.duration = 180 days; // 6 months vesting period (configurable)
}}
