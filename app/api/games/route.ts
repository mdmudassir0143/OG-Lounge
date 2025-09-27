import { type NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");
    const gameId = searchParams.get("gameId");

    // If gameId is provided, fetch a specific game
    if (gameId) {
      const game = await gameService.getGameById(gameId);
      
      if (!game) {
        return NextResponse.json(
          { error: "Game not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        games: [game],
      });
    }

    // Otherwise, fetch games by wallet address
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address or game ID is required" },
        { status: 400 }
      );
    }

    const games = await gameService.getGamesByWallet(walletAddress);

    return NextResponse.json({
      success: true,
      games,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
