import { type NextRequest, NextResponse } from "next/server";
import { type Game, gameService } from "@/lib/game-service";
import client from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Ensure MongoDB connection
    await client.connect();

    let games: Game[] = [];
    if (search) {
      games = await gameService.searchGames(search, "marketplace");
    } else {
      games = await gameService.getMarketplaceGames(limit, skip);
    }

    return NextResponse.json({
      success: true,
      games,
      page,
      limit,
    });
  } catch (error) {
    console.error("Marketplace API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch marketplace games",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
