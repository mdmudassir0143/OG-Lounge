import { type NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";

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
