import { type NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";
import client from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { gameId, type, walletAddress, version } = await request.json();

    if (!(gameId && type && walletAddress && version)) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: gameId, type, walletAddress, version",
        },
        { status: 400 }
      );
    }

    if (type !== "marketplace" && type !== "community") {
      return NextResponse.json(
        { error: 'Type must be either "marketplace" or "community"' },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    await client.connect();

    let result: boolean;
    if (type === "marketplace") {
      result = await gameService.publishToMarketplace(
        gameId,
        version,
        walletAddress
      );
    } else {
      result = await gameService.publishToCommunity(
        gameId,
        version,
        walletAddress
      );
    }

    return NextResponse.json({
      success: true,
      published: result,
      type,
    });
  } catch (error) {
    console.error("Publish API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to publish game",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
