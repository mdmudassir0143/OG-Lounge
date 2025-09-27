import { createPublicClient, http, type Address } from 'viem';
import { sepolia } from 'viem/chains'; // Adjust chain as needed
import type { Game } from './game-service';
import { gameService } from './game-service';

export interface NFTListing {
  listingId: bigint;
  seller: Address;
  tokenId: bigint;
  price: bigint;
  listedAt: bigint;
  game?: Game; // Associated game data
}

class MarketplaceService {
  private publicClient = createPublicClient({
    chain: sepolia, // Adjust to your chain
    transport: http(),
  });

  private marketplaceAddress = "0xc4A512632e84b15Aa743fe52A48096CaF37605FD" as Address; // From contracts-context

  // ABI for reading marketplace listings
  private marketplaceABI = [
    {
      type: "function",
      name: "listingCounter",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "listings",
      inputs: [{ name: "", type: "uint256" }],
      outputs: [
        { name: "seller", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "price", type: "uint256" },
        { name: "listedAt", type: "uint256" }
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getListing",
      inputs: [{ name: "_listingId", type: "uint256" }],
      outputs: [
        {
          name: "",
          type: "tuple",
          components: [
            { name: "seller", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "price", type: "uint256" },
            { name: "listedAt", type: "uint256" }
          ]
        }
      ],
      stateMutability: "view",
    },
  ] as const;

  /**
   * Get all active NFT listings from the marketplace
   */
  async getActiveListings(): Promise<NFTListing[]> {
    try {
      // Get the total number of listings
      const listingCounter = await this.publicClient.readContract({
        address: this.marketplaceAddress,
        abi: this.marketplaceABI,
        functionName: 'listingCounter',
      }) as bigint;

      const listings: NFTListing[] = [];
      
      // Fetch all listings (in a real app, you'd want pagination)
      for (let i = BigInt(1); i <= listingCounter && i <= BigInt(100); i++) { // Limit to 100 for performance
        try {
          const listingResult = await this.publicClient.readContract({
            address: this.marketplaceAddress,
            abi: this.marketplaceABI,
            functionName: 'getListing',
            args: [i],
          });

          const listing = listingResult as any; // Type assertion for the tuple

          // Check if listing is still active (seller is not zero address)
          if (listing[0] !== '0x0000000000000000000000000000000000000000') {
            listings.push({
              listingId: i,
              seller: listing[0] as Address,
              tokenId: listing[1] as bigint,
              price: listing[2] as bigint,
              listedAt: listing[3] as bigint,
            });
          }
        } catch (error) {
          console.error(`Failed to fetch listing ${i}:`, error);
          // Continue with other listings
        }
      }

      // Sort by listing time (newest first)
      return listings.sort((a, b) => Number(b.listedAt) - Number(a.listedAt));
    } catch (error) {
      console.error('Failed to fetch marketplace listings:', error);
      return [];
    }
  }

  /**
   * Get listings with associated game data
   */
  async getListingsWithGameData(): Promise<NFTListing[]> {
    try {
      const listings = await this.getActiveListings();
      
      if (listings.length === 0) {
        return [];
      }

      // For each listing, try to fetch the associated game data
      const listingsWithGames: NFTListing[] = [];
      
      for (const listing of listings) {
        try {
          // Try to find the game by querying the API
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/games/by-token/${listing.tokenId}`);
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.game) {
              listingsWithGames.push({
                ...listing,
                game: result.game,
              });
            } else {
              // Add listing without game data
              listingsWithGames.push(listing);
            }
          } else {
            // Add listing without game data
            listingsWithGames.push(listing);
          }
        } catch (error) {
          console.error(`Failed to fetch game for token ${listing.tokenId}:`, error);
          // Add listing without game data
          listingsWithGames.push(listing);
        }
      }
      
      return listingsWithGames;
    } catch (error) {
      console.error('Failed to fetch listings with game data:', error);
      return [];
    }
  }

  /**
   * Get a specific listing by ID
   */
  async getListing(listingId: bigint): Promise<NFTListing | null> {
    try {
      const listingResult = await this.publicClient.readContract({
        address: this.marketplaceAddress,
        abi: this.marketplaceABI,
        functionName: 'getListing',
        args: [listingId],
      });

      const listing = listingResult as any; // Type assertion for the tuple

      // Check if listing exists and is active
      if (listing[0] === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      return {
        listingId,
        seller: listing[0] as Address,
        tokenId: listing[1] as bigint,
        price: listing[2] as bigint,
        listedAt: listing[3] as bigint,
      };
    } catch (error) {
      console.error(`Failed to fetch listing ${listingId}:`, error);
      return null;
    }
  }

  /**
   * Get listings by seller address
   */
  async getListingsBySeller(seller: Address): Promise<NFTListing[]> {
    const allListings = await this.getActiveListings();
    return allListings.filter(listing => 
      listing.seller.toLowerCase() === seller.toLowerCase()
    );
  }

  /**
   * Helper method to get all games with token IDs from database
   */
  private async getAllGamesWithTokenIds(): Promise<Game[]> {
    try {
      // This is a simplified approach - in a real app, you might need a more efficient query
      // You could add a method to gameService to fetch only games with tokenIds
      
      // For now, we'll simulate getting all games and filtering those with tokenIds
      // In reality, you'd want to query the database more efficiently
      
      // Since we don't have a direct method, we'll need to implement this differently
      // Let's return an empty array for now and implement the filtering in the calling code
      return [];
    } catch (error) {
      console.error('Failed to fetch games with token IDs:', error);
      return [];
    }
  }
}

export const marketplaceService = new MarketplaceService();