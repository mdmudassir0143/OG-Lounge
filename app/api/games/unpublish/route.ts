import { type NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";

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

    // Only allow owner to unpublish
    const game = await gameService.getGameById(gameId);
    if (!game || game.walletAddress !== walletAddress) {
      return NextResponse.json(
        { error: "Game not found or unauthorized" },
        { status: 403 }
      );
    }

    if (type === "marketplace") {
      await (await import("@/lib/mongodb")).default
        .db("game-hub")
        .collection("games")
        .updateOne(
          { gameId },
          { $set: { isPublishedToMarketplace: false, updatedAt: new Date() } }
        );
    } else {
      await (await import("@/lib/mongodb")).default
        .db("game-hub")
        .collection("games")
        .updateOne(
          { gameId },
          { $set: { isPublishedToCommunity: false, updatedAt: new Date() } }
        );
    }

    return NextResponse.json({ success: true, type });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to unpublish" },
      { status: 500 }
    );
  }
}
