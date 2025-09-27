import { type NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await gameService.getGameById(id);

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 }
      );
    }

    // Check if game is published to community
    if (!game.isPublishedToCommunity) {
      return NextResponse.json(
        { success: false, error: "Game not published to community" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      game,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}
