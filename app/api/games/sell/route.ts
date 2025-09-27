import { NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";
import client from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { gameId, walletAddress, price, action } = await request.json();

    if (!gameId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: gameId or walletAddress" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("game-hub");
    
    // Get the game to verify ownership
    const game = await gameService.getGameById(gameId);
    if (!game) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (game.walletAddress !== walletAddress) {
      return NextResponse.json(
        { success: false, error: "You can only sell games you own" },
        { status: 403 }
      );
    }

    if (action === "remove") {
      // Remove game from sale
      await db.collection("games").updateOne(
        { gameId },
        {
          $set: {
            isForSale: false,
            salePrice: null,
            listedForSaleAt: null,
            updatedAt: new Date(),
          }
        }
      );

      return NextResponse.json({
        success: true,
        message: "Game removed from sale successfully"
      });
    }

    // List game for sale
    if (!price || price <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid price is required" },
        { status: 400 }
      );
    }

    const MIN_PRICE = 1; // Minimum $1 USD
    if (price < MIN_PRICE) {
      return NextResponse.json(
        { success: false, error: `Minimum price is $${MIN_PRICE} USD` },
        { status: 400 }
      );
    }

    // Update game to be for sale
    await db.collection("games").updateOne(
      { gameId },
      {
        $set: {
          isForSale: true,
          salePrice: price,
          listedForSaleAt: new Date(),
          updatedAt: new Date(),
        }
      }
    );

    // Create notification
    await db.collection("notifications").insertOne({
      walletAddress,
      type: "game_listed",
      title: "Game Listed for Sale",
      message: `Your game "${game.title}" is now listed for $${price} USD (payable in ETH)`,
      gameId,
      amount: price,
      currency: "GEM",
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Game listed for $${price} USD (payable in ETH)`,
      saleDetails: {
        gameId,
        title: game.title,
        price,
        listedAt: new Date(),
      }
    });

  } catch (error) {
    console.error("Game sell error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process sale listing" },
      { status: 500 }
    );
  }
}