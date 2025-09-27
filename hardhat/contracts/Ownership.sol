// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Ownership is 
    ERC721,
    ERC721Enumerable,
    Ownable,
    ReentrancyGuard 
{
   
    uint256 private _tokenIdCounter;
    address public marketplace;
    address public gamehub;
    
    mapping(uint256 => address) public creators;
    
    event TokenMinted(uint256 indexed tokenId, address indexed to);
    event MarketplaceUpdated(address indexed newMarketplace);
    event GameHubUpdated(address indexed newgamehub);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {}


    modifier onlyAuthorized {
        require(
            msg.sender == owner() || msg.sender == marketplace || msg.sender == gamehub,
            "Not authorized"
        );
        _;
    }

    function mint(address to) external nonReentrant onlyAuthorized returns(uint256) {

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        creators[tokenId] = msg.sender;
        _safeMint(to, tokenId);

        emit TokenMinted(tokenId, to);
        return tokenId;

    }

    function setMarketplace(address _marketplace) external onlyOwner {
        marketplace = _marketplace;
        emit MarketplaceUpdated(_marketplace);
    }
    
    function setGameHub(address _gamehub) external onlyOwner {
        gamehub = _gamehub;
        emit GameHubUpdated(_gamehub);
    }

    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }


    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        
        for (uint256 i = 0; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }

    function isApprovedForAll(address owner, address operator) 
        public 
        view 
        override(ERC721, IERC721) 
        returns (bool) 
    {
        if (operator == marketplace) {
            return true;
        }
        return super.isApprovedForAll(owner, operator);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) onlyAuthorized {
        super.transferFrom(from, to, tokenId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
