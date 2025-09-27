import { type NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";

export async function POST(request: NextRequest) {
  try {
    const { gameId, walletAddress } = await request.json();

    if (!(gameId && walletAddress)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const deleted = await gameService.deleteGame(gameId, walletAddress);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete game" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Game deleted" });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete game",
      },
      { status: 500 }
    );
  }
}
