// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    
    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        uint256 listedAt;
    }

    mapping(uint256 => Listing) public listings;

    uint256 private listingCounter;
    address public immutable i_nftContract;

    // Events
    event ItemListed(
        uint256 listingId,
        address indexed seller,
        uint256 tokenId,
        uint256 price
    );

    event ItemSold(
        uint256 indexed _listingId,
        address indexed buyer,
        address indexed seller,
        uint256 tokenId,
        uint256 price
    );

    event ListingCancelled(uint256 indexed listingId);

    constructor(address initialOwner, address _i_nftContract) Ownable(initialOwner) {  
        i_nftContract = _i_nftContract;
    }

    function listItem(
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(IERC721(i_nftContract).ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            IERC721(i_nftContract).isApprovedForAll(msg.sender, address(this)) ||
            IERC721(i_nftContract).getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );

        listingCounter++;

        listings[listingCounter] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            listedAt: block.timestamp
        });

        emit ItemListed(listingCounter, msg.sender, tokenId, price);
    }

    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own item");

        IERC721(i_nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        payable(listing.seller).transfer(listing.price);

        emit ItemSold(listingId, msg.sender, listing.seller, listing.tokenId, listing.price);

        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
    }

    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not the seller");

        emit ListingCancelled(_listingId);
    }

    function getListing(uint256 _listingId) external view returns (Listing memory) {
        return listings[_listingId];
    }
}
