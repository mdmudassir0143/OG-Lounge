// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract GameMarketplace is Ownable, ReentrancyGuard, Pausable {
    uint256 private _nextGameId = 1;
    IPyth public pythContract;
    
    struct Game {
        string title;
        string description;
        address owner;
        address creator;
        uint256 priceUSD;
        bool isListed;
        uint256 createdAt;
        uint256 totalSales;
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public ownerGames;
    mapping(address => uint256[]) public creatorGames;
    
    uint256 public constant PLATFORM_FEE = 250;
    bytes32 public constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    address public platformWallet;

    event GameCreated(uint256 indexed gameId, address indexed creator, string title, uint256 priceUSD);
    event GamePurchased(uint256 indexed gameId, address indexed buyer, address indexed seller, uint256 paidAmount);
    event GameListed(uint256 indexed gameId, uint256 priceUSD);
    event GameDelisted(uint256 indexed gameId);
    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);

    modifier gameExists(uint256 gameId) {
        require(games[gameId].creator != address(0), "Game does not exist");
        _;
    }
    
    modifier onlyGameOwner(uint256 gameId) {
        require(games[gameId].owner == msg.sender, "Not game owner");
        _;
    }

    modifier validPrice(uint256 priceUSD) {
        require(priceUSD > 0, "Price must be greater than zero");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    constructor(address _pythContract, address _platformWallet) 
        Ownable(msg.sender) 
        validAddress(_pythContract) 
        validAddress(_platformWallet) 
    {
        pythContract = IPyth(_pythContract);
        platformWallet = _platformWallet;
    }

    function createGame(
        string memory title,
        string memory description,
        uint256 priceUSD
    ) external whenNotPaused validPrice(priceUSD) returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(title).length <= 100, "Title too long");
        require(bytes(description).length <= 500, "Description too long");

        uint256 gameId = _nextGameId++;

        Game storage newGame = games[gameId];
        newGame.title = title;
        newGame.description = description;
        newGame.owner = msg.sender;
        newGame.creator = msg.sender;
        newGame.priceUSD = priceUSD;
        newGame.isListed = true;
        newGame.createdAt = block.timestamp;
        newGame.totalSales = 0;

        ownerGames[msg.sender].push(gameId);
        creatorGames[msg.sender].push(gameId);

        emit GameCreated(gameId, msg.sender, title, priceUSD);
        return gameId;
    }

    function purchaseGame(
        uint256 gameId,
        bytes[] calldata priceUpdateData
    ) external payable nonReentrant whenNotPaused gameExists(gameId) {
        Game storage game = games[gameId];
        require(game.isListed, "Game not listed for sale");
        require(game.owner != msg.sender, "Cannot buy own game");

        uint256 updateFee = 0;
        if (priceUpdateData.length > 0) {
            updateFee = pythContract.getUpdateFee(priceUpdateData);
            pythContract.updatePriceFeeds{value: updateFee}(priceUpdateData);
        }

        uint256 priceInWei = _calculatePriceInETH(game.priceUSD);
        uint256 totalRequired = priceInWei + updateFee;
        
        require(msg.value >= totalRequired, "Insufficient payment");

        address currentOwner = game.owner;
        
        _processPayment(priceInWei, currentOwner);
        _removeGameFromOwner(currentOwner, gameId);

        game.owner = msg.sender;
        game.isListed = false;
        game.totalSales++;
        
        ownerGames[msg.sender].push(gameId);

        emit GamePurchased(gameId, msg.sender, currentOwner, priceInWei);

        if (msg.value > totalRequired) {
            payable(msg.sender).transfer(msg.value - totalRequired);
        }
    }

    function listGameForSale(uint256 gameId, uint256 priceUSD) 
        external onlyGameOwner(gameId) gameExists(gameId) validPrice(priceUSD) 
    {
        require(!games[gameId].isListed, "Game already listed");
        
        games[gameId].priceUSD = priceUSD;
        games[gameId].isListed = true;

        emit GameListed(gameId, priceUSD);
    }

    function delistGame(uint256 gameId) external onlyGameOwner(gameId) gameExists(gameId) {
        require(games[gameId].isListed, "Game not listed");
        
        games[gameId].isListed = false;
        emit GameDelisted(gameId);
    }

    function updateGamePrice(uint256 gameId, uint256 newPriceUSD) 
        external onlyGameOwner(gameId) gameExists(gameId) validPrice(newPriceUSD) 
    {
        require(games[gameId].isListed, "Game not listed");
        
        games[gameId].priceUSD = newPriceUSD;
        
        emit GameListed(gameId, newPriceUSD);
    }

    function getGame(uint256 gameId) external view gameExists(gameId) returns (
        string memory title,
        string memory description,
        address owner,
        address creator,
        uint256 priceUSD,
        bool isListed,
        uint256 createdAt,
        uint256 totalSales
    ) {
        Game storage game = games[gameId];
        return (
            game.title,
            game.description,
            game.owner,
            game.creator,
            game.priceUSD,
            game.isListed,
            game.createdAt,
            game.totalSales
        );
    }

    function isOwner(uint256 gameId, address account) external view gameExists(gameId) returns (bool) {
        return games[gameId].owner == account;
    }

    function getOwnerGames(address owner) external view returns (uint256[] memory) {
        return ownerGames[owner];
    }

    function getCreatorGames(address creator) external view returns (uint256[] memory) {
        return creatorGames[creator];
    }

    function getCurrentPriceInETH(uint256 gameId) external view gameExists(gameId) returns (uint256) {
        return _calculatePriceInETH(games[gameId].priceUSD);
    }

    function totalGames() external view returns (uint256) {
        return _nextGameId - 1;
    }

    function getMarketplaceStats() external view returns (uint256 totalGames_, uint256 totalListedGames, uint256 totalSales) {
        totalGames_ = _nextGameId - 1;
        uint256 listedCount = 0;
        uint256 salesCount = 0;
        
        for (uint256 i = 1; i <= totalGames_; i++) {
            if (games[i].isListed) {
                listedCount++;
            }
            salesCount += games[i].totalSales;
        }
        
        return (totalGames_, listedCount, salesCount);
    }

    function _calculatePriceInETH(uint256 usdPriceCents) internal view returns (uint256) {
        PythStructs.Price memory ethPrice = pythContract.getPriceNoOlderThan(ETH_USD_PRICE_ID, 3600);
        
        require(ethPrice.price > 0, "Invalid ETH price from oracle");
        
        uint256 priceInWei = (usdPriceCents * 10**18) / (uint256(int256(ethPrice.price)) * 100);
        
        return priceInWei;
    }

    function _processPayment(uint256 totalAmount, address seller) internal {
        require(totalAmount > 0, "Invalid payment amount");
        
        uint256 platformFeeAmount = (totalAmount * PLATFORM_FEE) / 10000;
        uint256 sellerAmount = totalAmount - platformFeeAmount;
        
        if (platformFeeAmount > 0) {
            (bool feeSuccess, ) = payable(platformWallet).call{value: platformFeeAmount}("");
            require(feeSuccess, "Platform fee transfer failed");
        }
        
        if (sellerAmount > 0) {
            (bool sellerSuccess, ) = payable(seller).call{value: sellerAmount}("");
            require(sellerSuccess, "Seller payment transfer failed");
        }
    }

    function _removeGameFromOwner(address owner, uint256 gameId) internal {
        uint256[] storage ownedGames = ownerGames[owner];
        uint256 length = ownedGames.length;
        
        for (uint256 i = 0; i < length; i++) {
            if (ownedGames[i] == gameId) {
                ownedGames[i] = ownedGames[length - 1];
                ownedGames.pop();
                break;
            }
        }
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner validAddress(_platformWallet) {
        address oldWallet = platformWallet;
        platformWallet = _platformWallet;
        emit PlatformWalletUpdated(oldWallet, _platformWallet);
    }

    function setPythContract(address _pythContract) external onlyOwner validAddress(_pythContract) {
        pythContract = IPyth(_pythContract);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    receive() external payable {}

    fallback() external payable {
        revert("Function not found");
    }
}
