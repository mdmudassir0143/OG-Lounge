// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

/**
 * @title GameEconomy
 * @dev Smart contract for dynamic game pricing using Pyth Network price feeds
 * @notice This contract enables real-time price adjustments for games based on market conditions
 */
contract GameEconomy {
    IPyth pyth;
    
    // Events
    event GamePriceUpdated(uint256 indexed gameId, uint256 newPrice, int64 ethPrice);
    event GameRegistered(uint256 indexed gameId, address indexed owner, uint256 basePrice);
    event GamePurchased(uint256 indexed gameId, address indexed buyer, uint256 pricePaid);
    
    // Structs
    struct Game {
        uint256 id;
        address owner;
        string metadataHash; // IPFS hash
        uint256 basePriceUSD; // Price in USD cents (e.g., 500 = $5.00)
        uint256 currentPriceWei; // Current price in Wei
        bool isActive;
        uint256 totalSales;
        uint256 createdAt;
    }
    
    struct PriceConfig {
        bytes32 priceFeedId; // Pyth price feed ID
        uint256 volatilityMultiplier; // Multiplier for price volatility (basis points)
        uint256 lastUpdateTime;
        int64 lastPrice;
    }
    
    // Storage
    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public ownerGames;
    PriceConfig public priceConfig;
    
    uint256 public gameCounter;
    uint256 public constant PLATFORM_FEE = 250; // 2.5% in basis points
    address public platformWallet;
    
    // Price feed configuration
    bytes32 public constant ETH_USD_PRICE_FEED = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace; // ETH/USD price feed ID
    
    modifier onlyGameOwner(uint256 gameId) {
        require(games[gameId].owner == msg.sender, "Not game owner");
        _;
    }
    
    modifier gameExists(uint256 gameId) {
        require(games[gameId].id == gameId && games[gameId].isActive, "Game not found or inactive");
        _;
    }
    
    constructor(address _pythAddress, address _platformWallet) {
        pyth = IPyth(_pythAddress);
        platformWallet = _platformWallet;
        
        // Initialize price configuration
        priceConfig = PriceConfig({
            priceFeedId: ETH_USD_PRICE_FEED,
            volatilityMultiplier: 10000, // 100% (no adjustment initially)
            lastUpdateTime: block.timestamp,
            lastPrice: 0
        });
    }
    
    /**
     * @dev Register a new game with base USD pricing
     * @param metadataHash IPFS hash containing game metadata
     * @param basePriceUSD Base price in USD cents (e.g., 500 = $5.00)
     */
    function registerGame(string calldata metadataHash, uint256 basePriceUSD) external returns (uint256) {
        require(basePriceUSD > 0, "Price must be greater than 0");
        require(bytes(metadataHash).length > 0, "Metadata hash required");
        
        gameCounter++;
        uint256 gameId = gameCounter;
        
        // Calculate initial price in Wei
        uint256 initialPriceWei = _calculateGamePriceInWei(basePriceUSD);
        
        games[gameId] = Game({
            id: gameId,
            owner: msg.sender,
            metadataHash: metadataHash,
            basePriceUSD: basePriceUSD,
            currentPriceWei: initialPriceWei,
            isActive: true,
            totalSales: 0,
            createdAt: block.timestamp
        });
        
        ownerGames[msg.sender].push(gameId);
        
        emit GameRegistered(gameId, msg.sender, initialPriceWei);
        return gameId;
    }
    
    /**
     * @dev Purchase a game with dynamic pricing
     * @param gameId The game to purchase
     * @param priceUpdateData Pyth price update data
     */
    function purchaseGame(uint256 gameId, bytes[] calldata priceUpdateData) external payable gameExists(gameId) {
        // Update price feeds
        uint fee = pyth.getUpdateFee(priceUpdateData);
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);
        
        // Get current game price
        uint256 currentPrice = getCurrentGamePrice(gameId);
        require(msg.value >= currentPrice + fee, "Insufficient payment");
        
        Game storage game = games[gameId];
        
        // Calculate platform fee
        uint256 platformFeeAmount = (currentPrice * PLATFORM_FEE) / 10000;
        uint256 ownerAmount = currentPrice - platformFeeAmount;
        
        // Transfer payments
        payable(game.owner).transfer(ownerAmount);
        payable(platformWallet).transfer(platformFeeAmount);
        
        // Refund excess payment
        uint256 totalCost = currentPrice + fee;
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        // Update game stats
        game.totalSales++;
        
        emit GamePurchased(gameId, msg.sender, currentPrice);
    }
    
    /**
     * @dev Get current game price in Wei based on USD price and ETH/USD rate
     * @param gameId The game ID
     * @return Current price in Wei
     */
    function getCurrentGamePrice(uint256 gameId) public view gameExists(gameId) returns (uint256) {
        Game memory game = games[gameId];
        return _calculateGamePriceInWei(game.basePriceUSD);
    }
    
    /**
     * @dev Update game price based on current market conditions
     * @param gameId The game to update
     * @param priceUpdateData Pyth price update data
     */
    function updateGamePrice(uint256 gameId, bytes[] calldata priceUpdateData) external payable gameExists(gameId) {
        // Update price feeds
        uint fee = pyth.getUpdateFee(priceUpdateData);
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);
        
        // Calculate new price
        uint256 newPrice = getCurrentGamePrice(gameId);
        games[gameId].currentPriceWei = newPrice;
        
        // Get current ETH price for event
        PythStructs.Price memory ethPrice = pyth.getPriceUnsafe(ETH_USD_PRICE_FEED);
        
        emit GamePriceUpdated(gameId, newPrice, ethPrice.price);
        
        // Refund excess payment
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
    }
    
    /**
     * @dev Calculate game price in Wei based on USD price
     * @param basePriceUSD Price in USD cents
     * @return Price in Wei
     */
    function _calculateGamePriceInWei(uint256 basePriceUSD) internal view returns (uint256) {
        // Get ETH/USD price from Pyth
        PythStructs.Price memory ethPrice = pyth.getPriceUnsafe(ETH_USD_PRICE_FEED);
        require(ethPrice.price > 0, "Invalid ETH price");
        
        // Convert price to proper decimals
        // ETH price is typically with 8 decimals, convert to 18 decimals for Wei calculation
        uint256 ethPriceAdjusted = uint256(uint64(ethPrice.price)) * 10**(18 - uint32(-ethPrice.expo));
        
        // Calculate price in Wei
        // basePriceUSD is in cents, so divide by 100 to get dollars
        // Then multiply by 10^18 and divide by ETH price to get Wei
        uint256 priceInWei = (basePriceUSD * 1e18 * 100) / ethPriceAdjusted;
        
        return priceInWei;
    }
    
    /**
     * @dev Get game details
     * @param gameId The game ID
     * @return Game struct data
     */
    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }
    
    /**
     * @dev Get games owned by an address
     * @param owner The owner address
     * @return Array of game IDs
     */
    function getOwnerGames(address owner) external view returns (uint256[] memory) {
        return ownerGames[owner];
    }
    
    /**
     * @dev Get current ETH price from Pyth
     * @return Current ETH/USD price
     */
    function getCurrentETHPrice() external view returns (PythStructs.Price memory) {
        return pyth.getPriceUnsafe(ETH_USD_PRICE_FEED);
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFee New fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external {
        require(msg.sender == platformWallet, "Only platform can update fee");
        require(newFee <= 1000, "Fee cannot exceed 10%");
        // Platform fee update logic would go here
    }
    
    /**
     * @dev Deactivate a game (only game owner)
     * @param gameId The game to deactivate
     */
    function deactivateGame(uint256 gameId) external onlyGameOwner(gameId) {
        games[gameId].isActive = false;
    }
    
    /**
     * @dev Reactivate a game (only game owner)
     * @param gameId The game to reactivate
     */
    function reactivateGame(uint256 gameId) external onlyGameOwner(gameId) {
        games[gameId].isActive = true;
    }
}