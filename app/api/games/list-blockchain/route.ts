import { NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";
import { BlockchainService } from "@/lib/blockchain-service";
import client from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { gameId, priceUSD, walletAddress } = await request.json();

    if (!gameId || !priceUSD || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: gameId, priceUSD, or walletAddress" },
        { status: 400 }
      );
    }

    await client.connect();
    
    // Get the game to verify ownership
    const game = await gameService.getGameById(gameId);
    if (!game) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (game.walletAddress !== walletAddress) {
      return NextResponse.json(
        { success: false, error: "You can only list your own games" },
        { status: 403 }
      );
    }

    // Check if already listed on blockchain
    if (game.blockchainGameId && game.isOnBlockchain) {
      return NextResponse.json(
        { 
          success: true, 
          blockchainGameId: game.blockchainGameId,
          message: "Game already listed on blockchain" 
        }
      );
    }

    // Create game on blockchain
    const blockchainService = new BlockchainService();
    
    try {
      const result = await blockchainService.createGame({
        title: game.title,
        description: game.description || "",
        priceUSD: priceUSD
      });

      // Update the game in database with blockchain info
      await gameService.updateGameBlockchainInfo(gameId, {
        blockchainGameId: parseInt(result.gameId),
        isOnBlockchain: true,
        blockchainListedAt: new Date(),
        isForSale: true,
        salePrice: priceUSD,
        listedForSaleAt: new Date()
      });

      return NextResponse.json({
        success: true,
        blockchainGameId: parseInt(result.gameId),
        transactionHash: result.transactionHash,
        message: "Game successfully listed on blockchain marketplace"
      });

    } catch (blockchainError) {
      console.error("Blockchain listing error:", blockchainError);
      
      // If blockchain fails, still update database for fallback
      await gameService.updateGameForSale(gameId, priceUSD);
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to list on blockchain, but marked for sale in database",
          details: blockchainError instanceof Error ? blockchainError.message : "Unknown blockchain error"
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("List game error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}