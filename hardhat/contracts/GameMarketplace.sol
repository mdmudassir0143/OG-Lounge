// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./GameEconomy.sol";

/**
 * @title GameMarketplace
 * @dev Advanced marketplace with auctions, bundling, and dynamic pricing strategies
 * @notice Extends GameEconomy with sophisticated trading mechanisms
 */
contract GameMarketplace is GameEconomy {
    
    // Additional events
    event AuctionCreated(uint256 indexed gameId, uint256 indexed auctionId, uint256 startingBid, uint256 duration);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 finalBid);
    event BundleCreated(uint256 indexed bundleId, uint256[] gameIds, uint256 price);
    event BundlePurchased(uint256 indexed bundleId, address indexed buyer);
    
    // Structs
    struct Auction {
        uint256 gameId;
        address seller;
        uint256 startingBid;
        uint256 currentBid;
        address currentBidder;
        uint256 endTime;
        bool isActive;
        bool isEnded;
    }
    
    struct Bundle {
        uint256[] gameIds;
        address creator;
        uint256 totalPrice;
        uint256 discountPercent; // Discount in basis points
        bool isActive;
        uint256 createdAt;
    }
    
    struct PricingStrategy {
        uint256 gameId;
        uint256 demandMultiplier; // Multiplier based on demand (basis points)
        uint256 timeDecayRate; // Price decay rate over time (basis points per day)
        uint256 lastSaleTime;
        uint256 saleCount24h;
        bool isDynamic;
    }
    
    // Storage
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Bundle) public bundles;
    mapping(uint256 => PricingStrategy) public pricingStrategies;
    mapping(uint256 => mapping(address => uint256)) public auctionBids; // auctionId => bidder => amount
    
    uint256 public auctionCounter;
    uint256 public bundleCounter;
    
    // Constants
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;
    uint256 public constant MAX_AUCTION_DURATION = 7 days;
    uint256 public constant MIN_BID_INCREMENT = 100; // 1% in basis points
    
    modifier validAuction(uint256 auctionId) {
        require(auctions[auctionId].isActive && !auctions[auctionId].isEnded, "Invalid auction");
        require(block.timestamp < auctions[auctionId].endTime, "Auction ended");
        _;
    }
    
    modifier auctionEnded(uint256 auctionId) {
        require(block.timestamp >= auctions[auctionId].endTime || auctions[auctionId].isEnded, "Auction not ended");
        _;
    }
    
    constructor(address _pythAddress, address _platformWallet) 
        GameEconomy(_pythAddress, _platformWallet) {}
    
    /**
     * @dev Create an auction for a game
     * @param gameId The game to auction
     * @param startingBid Starting bid in Wei
     * @param duration Auction duration in seconds
     */
    function createAuction(
        uint256 gameId, 
        uint256 startingBid, 
        uint256 duration
    ) external onlyGameOwner(gameId) returns (uint256) {
        require(duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION, "Invalid duration");
        require(startingBid > 0, "Starting bid must be positive");
        
        auctionCounter++;
        uint256 auctionId = auctionCounter;
        
        auctions[auctionId] = Auction({
            gameId: gameId,
            seller: msg.sender,
            startingBid: startingBid,
            currentBid: 0,
            currentBidder: address(0),
            endTime: block.timestamp + duration,
            isActive: true,
            isEnded: false
        });
        
        emit AuctionCreated(gameId, auctionId, startingBid, duration);
        return auctionId;
    }
    
    /**
     * @dev Place a bid on an auction
     * @param auctionId The auction to bid on
     */
    function placeBid(uint256 auctionId) external payable validAuction(auctionId) {
        Auction storage auction = auctions[auctionId];
        
        uint256 minBid = auction.currentBid == 0 ? 
            auction.startingBid : 
            auction.currentBid + (auction.currentBid * MIN_BID_INCREMENT / 10000);
            
        require(msg.value >= minBid, "Bid too low");
        require(msg.sender != auction.seller, "Cannot bid on own auction");
        
        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            payable(auction.currentBidder).transfer(auction.currentBid);
        }
        
        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;
        auctionBids[auctionId][msg.sender] = msg.value;
        
        emit BidPlaced(auctionId, msg.sender, msg.value);
    }
    
    /**
     * @dev End an auction and transfer ownership
     * @param auctionId The auction to end
     */
    function endAuction(uint256 auctionId) external auctionEnded(auctionId) {
        Auction storage auction = auctions[auctionId];
        require(!auction.isEnded, "Already ended");
        
        auction.isEnded = true;
        auction.isActive = false;
        
        if (auction.currentBidder != address(0)) {
            // Calculate fees
            uint256 platformFeeAmount = (auction.currentBid * PLATFORM_FEE) / 10000;
            uint256 sellerAmount = auction.currentBid - platformFeeAmount;
            
            // Transfer payments
            payable(auction.seller).transfer(sellerAmount);
            payable(platformWallet).transfer(platformFeeAmount);
            
            // Transfer game ownership (simplified - in practice would need NFT transfer)
            games[auction.gameId].owner = auction.currentBidder;
            
            emit AuctionEnded(auctionId, auction.currentBidder, auction.currentBid);
        } else {
            emit AuctionEnded(auctionId, address(0), 0);
        }
    }
    
    /**
     * @dev Create a game bundle with discount
     * @param gameIds Array of game IDs to bundle
     * @param discountPercent Discount percentage in basis points
     */
    function createBundle(
        uint256[] calldata gameIds, 
        uint256 discountPercent
    ) external returns (uint256) {
        require(gameIds.length >= 2, "Bundle needs at least 2 games");
        require(discountPercent <= 5000, "Discount cannot exceed 50%");
        
        // Verify ownership of all games
        uint256 totalBasePrice = 0;
        for (uint256 i = 0; i < gameIds.length; i++) {
            require(games[gameIds[i]].owner == msg.sender, "Must own all games");
            totalBasePrice += getCurrentGamePrice(gameIds[i]);
        }
        
        bundleCounter++;
        uint256 bundleId = bundleCounter;
        
        uint256 discountedPrice = totalBasePrice - (totalBasePrice * discountPercent / 10000);
        
        bundles[bundleId] = Bundle({
            gameIds: gameIds,
            creator: msg.sender,
            totalPrice: discountedPrice,
            discountPercent: discountPercent,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit BundleCreated(bundleId, gameIds, discountedPrice);
        return bundleId;
    }
    
    /**
     * @dev Purchase a bundle
     * @param bundleId The bundle to purchase
     * @param priceUpdateData Pyth price update data
     */
    function purchaseBundle(
        uint256 bundleId, 
        bytes[] calldata priceUpdateData
    ) external payable {
        Bundle storage bundle = bundles[bundleId];
        require(bundle.isActive, "Bundle not active");
        
        // Update price feeds
        uint fee = pyth.getUpdateFee(priceUpdateData);
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);
        
        require(msg.value >= bundle.totalPrice + fee, "Insufficient payment");
        
        // Calculate and transfer fees
        uint256 platformFeeAmount = (bundle.totalPrice * PLATFORM_FEE) / 10000;
        uint256 creatorAmount = bundle.totalPrice - platformFeeAmount;
        
        payable(bundle.creator).transfer(creatorAmount);
        payable(platformWallet).transfer(platformFeeAmount);
        
        // Refund excess
        uint256 totalCost = bundle.totalPrice + fee;
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        // Update sales stats for each game
        for (uint256 i = 0; i < bundle.gameIds.length; i++) {
            games[bundle.gameIds[i]].totalSales++;
        }
        
        bundle.isActive = false;
        emit BundlePurchased(bundleId, msg.sender);
    }
    
    /**
     * @dev Enable dynamic pricing for a game
     * @param gameId The game ID
     * @param demandMultiplier Demand-based price multiplier
     * @param timeDecayRate Time-based price decay rate
     */
    function enableDynamicPricing(
        uint256 gameId,
        uint256 demandMultiplier,
        uint256 timeDecayRate
    ) external onlyGameOwner(gameId) {
        pricingStrategies[gameId] = PricingStrategy({
            gameId: gameId,
            demandMultiplier: demandMultiplier,
            timeDecayRate: timeDecayRate,
            lastSaleTime: block.timestamp,
            saleCount24h: 0,
            isDynamic: true
        });
    }
    
    /**
     * @dev Get dynamic price for a game
     * @param gameId The game ID
     * @return Adjusted price in Wei
     */
    function getDynamicPrice(uint256 gameId) external view returns (uint256) {
        if (!pricingStrategies[gameId].isDynamic) {
            return getCurrentGamePrice(gameId);
        }
        
        uint256 basePrice = getCurrentGamePrice(gameId);
        PricingStrategy memory strategy = pricingStrategies[gameId];
        
        // Apply demand multiplier based on recent sales
        uint256 demandAdjustedPrice = basePrice * strategy.demandMultiplier / 10000;
        
        // Apply time decay
        uint256 daysSinceLastSale = (block.timestamp - strategy.lastSaleTime) / 1 days;
        uint256 decayAmount = demandAdjustedPrice * strategy.timeDecayRate * daysSinceLastSale / 10000;
        
        if (decayAmount < demandAdjustedPrice) {
            return demandAdjustedPrice - decayAmount;
        }
        
        return demandAdjustedPrice / 2; // Minimum 50% of original price
    }
    
    /**
     * @dev Get bundle details
     * @param bundleId The bundle ID
     * @return Bundle struct data
     */
    function getBundle(uint256 bundleId) external view returns (Bundle memory) {
        return bundles[bundleId];
    }
    
    /**
     * @dev Get auction details
     * @param auctionId The auction ID
     * @return Auction struct data
     */
    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }
    
    /**
     * @dev Get pricing strategy for a game
     * @param gameId The game ID
     * @return PricingStrategy struct data
     */
    function getPricingStrategy(uint256 gameId) external view returns (PricingStrategy memory) {
        return pricingStrategies[gameId];
    }
    
    /**
     * @dev Emergency function to cancel auction (only platform)
     * @param auctionId The auction to cancel
     */
    function emergencyCancelAuction(uint256 auctionId) external {
        require(msg.sender == platformWallet, "Only platform");
        
        Auction storage auction = auctions[auctionId];
        auction.isActive = false;
        auction.isEnded = true;
        
        // Refund current bidder if exists
        if (auction.currentBidder != address(0)) {
            payable(auction.currentBidder).transfer(auction.currentBid);
        }
    }
}