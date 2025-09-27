import { type NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";
import client from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    await client.connect();

    const games = await gameService.getGamesByWallet(walletAddress);

    return NextResponse.json({
      success: true,
      games,
    });
  } catch (error) {
    console.error("Games API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch games",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
