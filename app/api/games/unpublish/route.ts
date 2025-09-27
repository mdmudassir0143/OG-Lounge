import { type NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";
import client from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { gameId, type, walletAddress } = await request.json();

    if (!(gameId && type && walletAddress)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type !== "marketplace" && type !== "community") {
      return NextResponse.json(
        { error: 'Type must be "marketplace" or "community"' },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    await client.connect();

    // Only allow owner to unpublish
    const game = await gameService.getGameById(gameId);
    if (!game || game.walletAddress !== walletAddress) {
      return NextResponse.json(
        { error: "Game not found or unauthorized" },
        { status: 403 }
      );
    }

    // Use gameService for consistent database operations
    if (type === "marketplace") {
      await gameService.updateGame(gameId, { 
        isPublishedToMarketplace: false,
        marketplacePublishedAt: undefined 
      });
    } else {
      await gameService.updateGame(gameId, { 
        isPublishedToCommunity: false,
        communityPublishedAt: undefined 
      });
    }

    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error("Unpublish API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to unpublish" 
      },
      { status: 500 }
    );
  }
}
