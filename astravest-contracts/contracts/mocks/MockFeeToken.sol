// contracts/mocks/MockFeeToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockFeeToken is ERC20 {
    uint256 public feePercent = 10; // 10% fee

    constructor(uint256 initialSupply) ERC20("Fee Token", "FEE") {
        _mint(msg.sender, initialSupply);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        uint256 fee = (amount * feePercent) / 100;
        uint256 transferAmount = amount - fee;
        super._transfer(from, to, transferAmount);
        // The "fee" is just burned in this mock
    }
}