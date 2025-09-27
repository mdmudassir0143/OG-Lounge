import { type NextRequest, NextResponse } from "next/server";
import { gameService, type Game } from "@/lib/game-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = params.tokenId;

    if (!tokenId) {
      return NextResponse.json(
        { success: false, error: "Token ID is required" },
        { status: 400 }
      );
    }

    // Search through marketplace and community games
    // This is a temporary solution until we implement proper tokenId indexing
    const marketplaceGames = await gameService.getMarketplaceGames(1000, 0);
    const communityGames = await gameService.getCommunityGames(1000, 0);
    
    // Combine and deduplicate games
    const allGames = [...marketplaceGames, ...communityGames];
    const uniqueGames = allGames.filter(
      (game, index, self) => index === self.findIndex(g => g.gameId === game.gameId)
    );
    
    // Try to find game with matching tokenId
    const game = uniqueGames.find((g: Game) => 
      g.tokenId?.toString() === tokenId
    );

    if (game) {
      return NextResponse.json({
        success: true,
        game,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Game not found for this token ID" },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error("Failed to fetch game by tokenId:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}