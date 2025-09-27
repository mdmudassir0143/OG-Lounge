import { type NextRequest, NextResponse } from "next/server";
import { type Game, gameService } from "@/lib/game-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    let games: Game[] = [];
    if (search) {
      games = await gameService.searchGames(search, "community");
    } else {
      games = await gameService.getCommunityGames(limit, skip);
    }

    return NextResponse.json({
      success: true,
      games,
      page,
      limit,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch community games" },
      { status: 500 }
    );
  }
}
