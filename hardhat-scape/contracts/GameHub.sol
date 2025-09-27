// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./Ownership.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GameHub is ReentrancyGuard {
    address public immutable i_nftContract;
    constructor(address _ownership) {
        i_nftContract = _ownership;
    }

    mapping(address => uint256) public creatorEarnings;

    function buyChance(uint256 _numberOfchancesToBuy, uint256 _gameNftID) external payable {
        require(_numberOfchancesToBuy > 0, "Must buy at least one chance");
        require(_gameNftID < Ownership(i_nftContract).totalMinted(), "Invalid gameNftId");
        require(msg.value == 0.01 ether * _numberOfchancesToBuy, "Incorrect Ether value sent");

        address creator = Ownership(i_nftContract).ownerOf(_gameNftID);
        require(creator != address(0), "Creator is address 0");
        uint256 creatorGets = (msg.value * 70) / 100;
        creatorEarnings[creator] += creatorGets;
    }

    function withdrawEarnings() external nonReentrant {
        uint256 amount = creatorEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");
        creatorEarnings[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function getOwnership() external view returns (address) {
        return i_nftContract;
    }
}