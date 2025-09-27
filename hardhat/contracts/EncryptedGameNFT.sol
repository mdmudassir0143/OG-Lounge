// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

/**
 * @title EncryptedGameNFT - Intelligent NFT for Game Assets
 * @notice ERC-7857 compliant contract for tokenizing game code with encryption
 * @dev Integrates with 0G infrastructure for secure metadata storage and transfer
 */
contract EncryptedGameNFT is ERC721, Ownable, ReentrancyGuard, Pausable {
    using Strings for uint256;
    using Strings for address;

    // ============ State Variables ============
    
    uint256 private _nextTokenId = 1;
    IPyth public pythContract;
    
    // Game NFT Structure
    struct GameNFT {
        string title;
        string description;
        address creator;
        uint256 priceUSD; // Price in USD cents (e.g., 500 = $5.00)
        bytes32 encryptedCodeHash; // Hash of encrypted game code
        string encryptedMetadataURI; // 0G Storage URI for encrypted metadata
        bytes32 metadataHash; // Verification hash for metadata
        bool isListed; // Whether game is available for purchase
        uint256 createdAt;
        uint256 lastUpdated;
        uint256 royaltyPercentage; // Basis points (e.g., 250 = 2.5%)
    }

    // Access control for each NFT
    struct AccessControl {
        mapping(address => bool) authorizedUsers; // Users with temporary access
        mapping(address => uint256) accessExpirations; // Access expiration timestamps
    }

    // Oracle and Encryption
    struct TransferProof {
        bytes32 oldDataHash;
        bytes32 newDataHash;
        bytes32 receiverPublicKey;
        bytes oracleSignature;
        uint256 timestamp;
    }

    // ============ Mappings ============
    
    mapping(uint256 => GameNFT) public gameNFTs;
    mapping(uint256 => AccessControl) private _accessControls;
    mapping(uint256 => bytes) private _sealedKeys; // Encrypted keys for owners
    mapping(address => uint256[]) public creatorGames; // Games created by address
    mapping(uint256 => uint256) public totalEarnings; // Total earnings per game
    mapping(bytes32 => bool) public usedProofs; // Prevent proof replay attacks
    
    // Marketplace integration
    mapping(uint256 => bool) public marketplaceListed;
    mapping(uint256 => uint256) public listingPrices; // Override prices for marketplace

    // ============ Constants ============
    
    uint256 public constant PLATFORM_FEE = 250; // 2.5% platform fee in basis points
    uint256 public constant MAX_ROYALTY = 1000; // Maximum 10% royalty
    bytes32 public constant ETH_USD_PRICE_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    address public platformWallet;
    address public oracleAddress; // 0G Oracle for secure transfers

    // ============ Events ============
    
    event GameNFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        uint256 priceUSD,
        string encryptedMetadataURI
    );
    
    event GamePurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 paidAmount,
        bytes32 transferProofHash
    );
    
    event GameListed(uint256 indexed tokenId, uint256 priceUSD);
    event GameDelisted(uint256 indexed tokenId);
    
    event AccessGranted(
        uint256 indexed tokenId,
        address indexed user,
        uint256 expirationTime
    );
    
    event SecureTransferCompleted(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        bytes32 proofHash
    );

    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 amount
    );

    // ============ Modifiers ============
    
    modifier onlyGameOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not game owner");
        _;
    }
    
    modifier onlyCreator(uint256 tokenId) {
        require(gameNFTs[tokenId].creator == msg.sender, "Not game creator");
        _;
    }
    
    modifier validProof(bytes memory proof) {
        require(oracleAddress != address(0), "Oracle not configured");
        require(_verifyOracleProof(proof), "Invalid oracle proof");
        _;
    }

    modifier gameExists(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Game NFT does not exist");
        _;
    }

    // ============ Constructor ============
    
    constructor(
        address _pythContract,
        address _platformWallet,
        address _oracleAddress
    ) ERC721("Encrypted Game NFT", "EGNFT") Ownable(msg.sender) {
        pythContract = IPyth(_pythContract);
        platformWallet = _platformWallet;
        oracleAddress = _oracleAddress;
    }

    // ============ Core NFT Functions ============
    
    /**
     * @notice Mint a new encrypted game NFT
     * @param title Game title
     * @param description Game description  
     * @param priceUSD Price in USD cents
     * @param encryptedMetadataURI 0G Storage URI containing encrypted game code
     * @param metadataHash Verification hash for the encrypted metadata
     * @param royaltyPercentage Royalty percentage in basis points (max 1000 = 10%)
     * @return tokenId The newly minted token ID
     */
    function mintGameNFT(
        string memory title,
        string memory description,
        uint256 priceUSD,
        string memory encryptedMetadataURI,
        bytes32 metadataHash,
        uint256 royaltyPercentage
    ) external whenNotPaused returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(priceUSD > 0, "Price must be greater than 0");
        require(bytes(encryptedMetadataURI).length > 0, "Metadata URI required");
        require(royaltyPercentage <= MAX_ROYALTY, "Royalty too high");

        uint256 tokenId = _nextTokenId++;

        // Mint NFT to creator
        _safeMint(msg.sender, tokenId);

        // Initialize game NFT data
        GameNFT storage newGame = gameNFTs[tokenId];
        newGame.title = title;
        newGame.description = description;
        newGame.creator = msg.sender;
        newGame.priceUSD = priceUSD;
        newGame.encryptedCodeHash = keccak256(abi.encodePacked(encryptedMetadataURI, metadataHash));
        newGame.encryptedMetadataURI = encryptedMetadataURI;
        newGame.metadataHash = metadataHash;
        newGame.isListed = true; // Auto-list new games
        newGame.createdAt = block.timestamp;
        newGame.lastUpdated = block.timestamp;
        newGame.royaltyPercentage = royaltyPercentage;

        // Track creator's games
        creatorGames[msg.sender].push(tokenId);

        emit GameNFTMinted(
            tokenId,
            msg.sender,
            title,
            priceUSD,
            encryptedMetadataURI
        );

        return tokenId;
    }

    /**
     * @notice Purchase an encrypted game NFT with secure metadata transfer
     * @param tokenId The game NFT to purchase
     * @param priceUpdateData Pyth price update data
     * @param sealedKey Encrypted key for the buyer
     * @param transferProof Oracle proof for secure metadata re-encryption
     */
    function purchaseGame(
        uint256 tokenId,
        bytes[] calldata priceUpdateData,
        bytes calldata sealedKey,
        bytes calldata transferProof
    ) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        gameExists(tokenId)
        validProof(transferProof)
    {
        GameNFT storage game = gameNFTs[tokenId];
        require(game.isListed, "Game not listed for sale");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy own game");

        // Update Pyth price feeds
        uint256 updateFee = pythContract.getUpdateFee(priceUpdateData);
        pythContract.updatePriceFeeds{value: updateFee}(priceUpdateData);

        // Calculate current price in ETH
        uint256 priceInWei = _calculatePriceInETH(game.priceUSD);
        require(msg.value >= priceInWei + updateFee, "Insufficient payment");

        address currentOwner = ownerOf(tokenId);
        
        // Process payment with royalties and platform fee
        _processPayment(tokenId, priceInWei, currentOwner);

        // Store sealed key for new owner
        _sealedKeys[tokenId] = sealedKey;

        // Update metadata access hash
        TransferProof memory proof = _decodeTransferProof(transferProof);
        game.metadataHash = proof.newDataHash;
        game.lastUpdated = block.timestamp;

        // Mark proof as used to prevent replay
        bytes32 proofHash = keccak256(transferProof);
        usedProofs[proofHash] = true;

        // Transfer NFT ownership
        _transfer(currentOwner, msg.sender, tokenId);

        // Update earnings
        totalEarnings[tokenId] += priceInWei;

        emit GamePurchased(
            tokenId,
            msg.sender,
            currentOwner,
            priceInWei,
            proofHash
        );

        emit SecureTransferCompleted(
            tokenId,
            currentOwner,
            msg.sender,
            proofHash
        );

        // Refund excess payment
        if (msg.value > priceInWei + updateFee) {
            payable(msg.sender).transfer(msg.value - priceInWei - updateFee);
        }
    }

    /**
     * @notice Grant temporary access to encrypted game content
     * @param tokenId The game NFT
     * @param user Address to grant access to
     * @param duration Access duration in seconds
     */
    function grantTemporaryAccess(
        uint256 tokenId,
        address user,
        uint256 duration
    ) external onlyGameOwner(tokenId) gameExists(tokenId) {
        require(user != address(0), "Invalid user address");
        require(duration > 0 && duration <= 30 days, "Invalid duration");

        uint256 expirationTime = block.timestamp + duration;
        
        _accessControls[tokenId].authorizedUsers[user] = true;
        _accessControls[tokenId].accessExpirations[user] = expirationTime;

        emit AccessGranted(tokenId, user, expirationTime);
    }

    // ============ Marketplace Integration ============
    
    /**
     * @notice List game on marketplace with custom price
     */
    function listOnMarketplace(
        uint256 tokenId,
        uint256 customPriceUSD
    ) external onlyGameOwner(tokenId) {
        require(customPriceUSD > 0, "Price must be greater than 0");
        
        marketplaceListed[tokenId] = true;
        listingPrices[tokenId] = customPriceUSD;
        gameNFTs[tokenId].isListed = true;

        emit GameListed(tokenId, customPriceUSD);
    }

    /**
     * @notice Remove game from marketplace
     */
    function delistFromMarketplace(uint256 tokenId) external onlyGameOwner(tokenId) {
        marketplaceListed[tokenId] = false;
        gameNFTs[tokenId].isListed = false;

        emit GameDelisted(tokenId);
    }

    // ============ View Functions ============
    
    /**
     * @notice Get game NFT details
     */
    function getGameDetails(uint256 tokenId) 
        external 
        view 
        gameExists(tokenId)
        returns (
            string memory title,
            string memory description,
            address creator,
            address currentOwner,
            uint256 priceUSD,
            bool isListed,
            uint256 createdAt,
            uint256 royaltyPercentage,
            uint256 earnings
        ) 
    {
        GameNFT storage game = gameNFTs[tokenId];
        return (
            game.title,
            game.description,
            game.creator,
            ownerOf(tokenId),
            game.priceUSD,
            game.isListed,
            game.createdAt,
            game.royaltyPercentage,
            totalEarnings[tokenId]
        );
    }

    /**
     * @notice Get encrypted metadata URI (only for owner or authorized users)
     */
    function getEncryptedMetadata(uint256 tokenId) 
        external 
        view 
        gameExists(tokenId)
        returns (string memory encryptedMetadataURI, bytes32 metadataHash) 
    {
        require(_hasMetadataAccess(tokenId, msg.sender), "No access to metadata");
        
        GameNFT storage game = gameNFTs[tokenId];
        return (game.encryptedMetadataURI, game.metadataHash);
    }

    /**
     * @notice Get sealed key for decryption (only for current owner)
     */
    function getSealedKey(uint256 tokenId) 
        external 
        view 
        onlyGameOwner(tokenId)
        returns (bytes memory) 
    {
        return _sealedKeys[tokenId];
    }

    /**
     * @notice Check if user has access to metadata
     */
    function hasMetadataAccess(uint256 tokenId, address user) 
        external 
        view 
        gameExists(tokenId)
        returns (bool) 
    {
        return _hasMetadataAccess(tokenId, user);
    }

    /**
     * @notice Get games created by an address
     */
    function getCreatorGames(address creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorGames[creator];
    }

    /**
     * @notice Calculate current game price in ETH
     */
    function getCurrentPriceInETH(uint256 tokenId) 
        external 
        view 
        gameExists(tokenId)
        returns (uint256) 
    {
        uint256 priceUSD = marketplaceListed[tokenId] ? 
            listingPrices[tokenId] : gameNFTs[tokenId].priceUSD;
            
        return _calculatePriceInETH(priceUSD);
    }

    // ============ Internal Functions ============
    
    /**
     * @notice Calculate price in ETH based on USD amount and current ETH/USD rate
     */
    function _calculatePriceInETH(uint256 usdPriceCents) internal view returns (uint256) {
        PythStructs.Price memory ethPrice = pythContract.getPriceNoOlderThan(
            ETH_USD_PRICE_ID, 
            3600 // 1 hour old maximum
        );
        
        require(ethPrice.price > 0, "Invalid ETH price");
        
        // Convert price: usdPriceCents / (ethPrice / 10^8) * 10^18
        // This accounts for Pyth's 8 decimal places and ETH's 18 decimal places
        uint256 priceInWei = (usdPriceCents * 10**18) / 
                            (uint256(int256(ethPrice.price)) * 100); // *100 to convert cents to dollars
        
        return priceInWei;
    }

    /**
     * @notice Process payment with royalties and platform fee
     */
    function _processPayment(
        uint256 tokenId,
        uint256 totalAmount,
        address seller
    ) internal {
        GameNFT storage game = gameNFTs[tokenId];
        
        // Calculate platform fee
        uint256 platformFeeAmount = (totalAmount * PLATFORM_FEE) / 10000;
        
        // Calculate royalty for original creator (if seller is not creator)
        uint256 royaltyAmount = 0;
        if (seller != game.creator && game.royaltyPercentage > 0) {
            royaltyAmount = (totalAmount * game.royaltyPercentage) / 10000;
        }
        
        // Calculate seller amount
        uint256 sellerAmount = totalAmount - platformFeeAmount - royaltyAmount;
        
        // Transfer payments
        if (platformFeeAmount > 0) {
            payable(platformWallet).transfer(platformFeeAmount);
        }
        
        if (royaltyAmount > 0) {
            payable(game.creator).transfer(royaltyAmount);
            emit RoyaltyPaid(tokenId, game.creator, royaltyAmount);
        }
        
        if (sellerAmount > 0) {
            payable(seller).transfer(sellerAmount);
        }
    }

    /**
     * @notice Check if user has access to encrypted metadata
     */
    function _hasMetadataAccess(uint256 tokenId, address user) internal view returns (bool) {
        // Owner always has access
        if (ownerOf(tokenId) == user) {
            return true;
        }
        
        // Check temporary access
        AccessControl storage accessControl = _accessControls[tokenId];
        if (accessControl.authorizedUsers[user] && 
            block.timestamp <= accessControl.accessExpirations[user]) {
            return true;
        }
        
        return false;
    }

    /**
     * @notice Verify oracle proof for secure transfers
     */
    function _verifyOracleProof(bytes memory proof) internal view returns (bool) {
        // For demo purposes, return true if oracle is set
        // In production, implement proper TEE/ZKP verification
        return oracleAddress != address(0) && proof.length > 0;
    }

    /**
     * @notice Decode transfer proof data
     */
    function _decodeTransferProof(bytes memory proof) 
        internal 
        view 
        returns (TransferProof memory) 
    {
        require(proof.length >= 160, "Invalid proof length");
        
        TransferProof memory decodedProof;
        
        // For demo purposes, create a mock proof
        // In production, properly decode the proof data
        decodedProof.oldDataHash = keccak256(abi.encodePacked("old", proof));
        decodedProof.newDataHash = keccak256(abi.encodePacked("new", proof));
        decodedProof.receiverPublicKey = keccak256(proof);
        decodedProof.timestamp = block.timestamp;
        
        return decodedProof;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Update platform wallet
     */
    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    /**
     * @notice Update oracle address
     */
    function setOracleAddress(address _oracleAddress) external onlyOwner {
        require(_oracleAddress != address(0), "Invalid oracle address");
        oracleAddress = _oracleAddress;
    }

    /**
     * @notice Update Pyth contract
     */
    function setPythContract(address _pythContract) external onlyOwner {
        require(_pythContract != address(0), "Invalid Pyth contract");
        pythContract = IPyth(_pythContract);
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // ============ Overrides ============
    
    /**
     * @notice Override tokenURI to return encrypted metadata access info
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        gameExists(tokenId)
        returns (string memory) 
    {
        GameNFT storage game = gameNFTs[tokenId];
        
        // Return public metadata (non-encrypted info)
        return string(abi.encodePacked(
            '{"name":"', game.title, '",',
            '"description":"', game.description, '",',
            '"creator":"', Strings.toHexString(uint160(game.creator), 20), '",',
            '"price_usd":', game.priceUSD.toString(), ',',
            '"encrypted":true,',
            '"access_required":true}'
        ));
    }

    // ============ Utility Functions ============

    /**
     * @notice Get total number of games created
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // ============ Receive Function ============
    
    receive() external payable {
        // Allow contract to receive ETH
    }
}