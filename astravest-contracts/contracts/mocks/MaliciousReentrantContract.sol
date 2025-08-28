// contracts/mocks/MaliciousReentrantContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AstraVest.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MaliciousReentrantContract {
    AstraVest public immutable astraVest;
    IERC20 public immutable stakingToken;
    uint256 public poolId = 0;

    constructor(address _astraVestAddress) {
        astraVest = AstraVest(_astraVestAddress);
        stakingToken = IERC20(astraVest.stakingToken());
    }

    function attack() external {
        // Approve AstraVest to spend our tokens
        stakingToken.approve(address(astraVest), type(uint256).max);
        // Call stake, which will send tokens to this contract in a re-entrant attack
        astraVest.stake(poolId, 100);
    }

    // This function is called when AstraVest tries to send tokens back
    // In a real attack, the unstake function would be targeted.
    // We will simulate the re-entrancy on the stake function for this test.
    receive() external payable {
        // Re-entrant call: try to stake again while the first stake is still executing
        if (address(astraVest).balance > 0) { // Simple check to avoid infinite loops
            astraVest.stake(poolId, 50);
        }
    }
}