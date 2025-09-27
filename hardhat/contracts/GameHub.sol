// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "../src/Ownership.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GameHub is ReentrancyGuard {
    address public immutable i_nftContract;
    
    mapping(address => uint256) public creatorEarnings;
    mapping(address => mapping (uint256 => uint256)) userToPlayed;
    mapping(address => mapping (uint256 => uint256)) userToChances;


    constructor(address _ownership) {
        i_nftContract = _ownership;
    }

    function createGameNFT(address to) external payable {
        uint256 userTokenCount = getUserTokenCount(to);
        
        if (userTokenCount >= 2) {
            require(msg.value == 0.0005 ether, "Must pay 0.0005 ETH to mint additional tokens after owning 2");
        } else {
            require(msg.value == 0, "No payment required for first 2 tokens");
        }
        
        Ownership(i_nftContract).mint(to);
    }

    function playGame(uint256 tokenId) external {
        uint256 total = Ownership(i_nftContract).totalMinted();
        require(tokenId < total, "Invalid tokenId");
        
        uint256 timesPlayed = userToPlayed[msg.sender][tokenId];
        uint256 boughtChances = userToChances[msg.sender][tokenId];
        
        if (timesPlayed < 5) {
            userToPlayed[msg.sender][tokenId] += 1;
        } else {
            require(boughtChances > 0, "No free chances left. Buy chances to continue playing.");
            
            userToChances[msg.sender][tokenId] -= 1;
            userToPlayed[msg.sender][tokenId] += 1;
        }
    }

    function getChancesPlayed(address user, uint256 tokenId) external view returns (uint256) {
        return userToPlayed[user][tokenId];
    }

    function buyChance(uint256 _numberOfchancesToBuy, uint256 _gameNftID) external payable {
        require(_numberOfchancesToBuy > 0, "Must buy at least one chance");
        require(_gameNftID < Ownership(i_nftContract).totalMinted(), "Invalid gameNftId");
        require(msg.value == 0.0001 ether * _numberOfchancesToBuy, "Incorrect Ether value sent");

        address creator = Ownership(i_nftContract).ownerOf(_gameNftID);
        require(creator != address(0), "Creator is address 0");
        uint256 creatorGets = (msg.value * 70) / 100;
        creatorEarnings[creator] += creatorGets;
        
        userToChances[msg.sender][_gameNftID] += _numberOfchancesToBuy;
    }


    function withdrawEarnings() external nonReentrant {
        uint256 amount = creatorEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");
        creatorEarnings[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function getUserTokenCount(address user) public view returns (uint256) {
        return Ownership(i_nftContract).balanceOf(user);
    }
    
    function getRemainingFreeChances(address user, uint256 tokenId) external view returns (uint256) {
        uint256 timesPlayed = userToPlayed[user][tokenId];
        if (timesPlayed >= 5) {
            return 0;
        }
        return 5 - timesPlayed;
    }
    
    function getBoughtChances(address user, uint256 tokenId) external view returns (uint256) {
        return userToChances[user][tokenId];
    }

    function getOwnership() external view returns (address) {
        return i_nftContract;
    }
}