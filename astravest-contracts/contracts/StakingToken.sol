// contracts/StakingToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// This is a simple mock ERC20 token for testing purposes.
contract StakingToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Staking Token", "STK") {
        _mint(msg.sender, initialSupply);
    }
}