import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createEncryptedGameNFTService, type GameNFTDetails } from '@/lib/encrypted-game-nft-service-v2';

// Create a provider for reading contract data
function createProvider() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://evmrpc-testnet.0g.ai";
  return new ethers.JsonRpcProvider(rpcUrl);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');
    const tokenId = searchParams.get('tokenId');
    
    const provider = createProvider();
    const nftService = createEncryptedGameNFTService(provider);
    
    if (tokenId) {
      // Get specific NFT details
      const game = await nftService.getGameDetails(tokenId);
      
      if (!game) {
        return NextResponse.json(
          { success: false, error: 'Game not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        game
      });
    }
    
    if (creator) {
      // Get games by creator
      const games = await nftService.getCreatorGames(creator);
      
      return NextResponse.json({
        success: true,
        games
      });
    }
    
    // Get all games (limited approach for demo)
    const totalSupply = await nftService.getTotalSupply();
    const games: GameNFTDetails[] = [];
    
    // Handle case when no NFTs are minted yet
    if (totalSupply === 0) {
      return NextResponse.json({
        success: true,
        games: []
      });
    }
    
    // Fetch details for recent games (last 50)
    const startId = Math.max(1, totalSupply - 49);
    
    for (let i = startId; i <= totalSupply; i++) {
      try {
        const game = await nftService.getGameDetails(i.toString());
        if (game && game.isListed) {
          games.push(game);
        }
      } catch (error) {
        // Skip failed fetches (likely non-existent tokens)
        console.warn(`Skipping token ${i}:`, (error as Error).message);
      }
    }
    
    // Sort by creation date (newest first)
    games.sort((a, b) => b.createdAt - a.createdAt);
    
    return NextResponse.json({
      success: true,
      games,
      totalSupply
    });
    
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch encrypted NFT games'
      },
      { status: 500 }
    );
  }
}