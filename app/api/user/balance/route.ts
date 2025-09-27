import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("game-hub");
    
    // Get user balance
    const balanceDoc = await db.collection("user_balances").findOne({
      walletAddress
    });

    const balance = balanceDoc || {
      walletAddress,
      gemBalance: 0,
      usdBalance: 0,
      ethBalance: 0,
      updatedAt: new Date(),
    };

    // Get recent transactions
    const transactions = await db.collection("transactions")
      .find({
        $or: [
          { from: walletAddress },
          { to: walletAddress }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      success: true,
      balance: {
        gemBalance: balance.gemBalance || 0,
        usdBalance: balance.usdBalance || 0,
        ethBalance: balance.ethBalance || 0,
        lastUpdated: balance.updatedAt,
      },
      transactions: transactions.map(tx => ({
        transactionId: tx.transactionId,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        from: tx.from,
        to: tx.to,
        status: tx.status,
        createdAt: tx.createdAt,
        gameId: tx.gameId,
      }))
    });

  } catch (error) {
    console.error("Balance fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}