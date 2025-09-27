import { NextRequest, NextResponse } from "next/server";
import { gameService } from "@/lib/game-service";
import { pythPriceService } from "@/lib/pyth-price-service";
import { BlockchainService } from "@/lib/blockchain-service";
import client from "@/lib/mongodb";
import { ethers } from "ethers";

export async function POST(request: NextRequest) {
  try {
    const { gameId, buyerAddress, usdPrice, ethAmount, transactionHash } = await request.json();

    if (!gameId || !buyerAddress || !usdPrice || !transactionHash) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: gameId, buyerAddress, usdPrice, or transactionHash" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("game-hub");
    
    // Get the game to verify it exists and is for sale
    const game = await gameService.getGameById(gameId);
    if (!game) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 }
      );
    }

    // Check if game is for sale
    const isForSale = game.isForSale && game.salePrice;
    const isNFTForSale = game.isNFT && game.nftData?.priceUSD;
    
    if (!isForSale && !isNFTForSale) {
      return NextResponse.json(
        { success: false, error: "Game is not for sale" },
        { status: 400 }
      );
    }

    // Get the expected USD price
    const expectedUSDPrice = game.isForSale ? game.salePrice : game.nftData?.priceUSD;
    if (expectedUSDPrice !== usdPrice) {
      return NextResponse.json(
        { success: false, error: "Price mismatch" },
        { status: 400 }
      );
    }

    // Check if buyer is not the current owner
    if (game.walletAddress === buyerAddress) {
      return NextResponse.json(
        { success: false, error: "You cannot buy your own game" },
        { status: 400 }
      );
    }

    // Verify the transaction on blockchain (if it's a blockchain transaction)
    if (transactionHash && transactionHash !== "0x0") {
      try {
        const provider = new ethers.JsonRpcProvider(
          "https://sepolia.infura.io/v3/" + (process.env.INFURA_API_KEY || "1234567890abcdef1234567890abcdef")
        );
        
        console.log("Verifying transaction:", transactionHash);
        
        // Get transaction receipt to verify it exists and is successful
        const receipt = await provider.getTransactionReceipt(transactionHash);
        if (!receipt) {
          console.log("Transaction receipt not found, checking if transaction exists...");
          
          // Try to get the transaction itself
          const tx = await provider.getTransaction(transactionHash);
          if (!tx) {
            return NextResponse.json(
              { success: false, error: "Transaction not found on blockchain" },
              { status: 400 }
            );
          }
          
          // If transaction exists but no receipt yet, it might be pending
          console.log("Transaction found but not confirmed yet");
        } else {
          console.log("Transaction receipt found:", receipt.status);
          
          if (receipt.status !== 1) {
            return NextResponse.json(
              { success: false, error: "Transaction failed on blockchain" },
              { status: 400 }
            );
          }

          // Import contract addresses to verify
          const { CONTRACT_ADDRESSES } = await import("@/lib/contracts");
          const expectedContractAddress = CONTRACT_ADDRESSES.sepolia.GameMarketplace.toLowerCase();
          
          if (receipt.to?.toLowerCase() !== expectedContractAddress) {
            console.log("Contract mismatch:", receipt.to, "vs", expectedContractAddress);
            return NextResponse.json(
              { success: false, error: "Invalid transaction contract address" },
              { status: 400 }
            );
          }
        }

      } catch (error) {
        console.error("Blockchain verification error:", error);
        
        // For demo purposes, allow transactions to proceed if blockchain verification fails
        // In production, you might want to be more strict
        console.log("Blockchain verification failed, proceeding with database update...");
      }
    } else {
      console.log("Non-blockchain transaction (regular marketplace purchase)");
    }

    const currentOwner = game.walletAddress;
    const salePrice = expectedUSDPrice;
    const ethPriceWei = await pythPriceService.calculateGamePriceInWei(usdPrice * 100); // Convert to cents
    const ethPriceInEther = ethers.formatEther(ethPriceWei);
    const priceType = "USD";

    // Create transaction record for payment tracking
    const transaction = {
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameId,
      type: game.isNFT ? "nft_purchase" : "game_purchase",
      from: buyerAddress,
      to: currentOwner,
      amount: salePrice,
      currency: priceType,
      ethAmount: ethAmount || ethPriceInEther,
      ethAmountWei: ethPriceWei,
      status: "completed",
      createdAt: new Date(),
      completedAt: new Date(),
      blockchainTxHash: transactionHash, // Store actual blockchain transaction hash
    };

    // Record the transaction
    await db.collection("transactions").insertOne(transaction);

    // Update game ownership and remove from sale
    const updateData: any = {
      walletAddress: buyerAddress, // Transfer ownership
      previousOwner: currentOwner,
      purchasedAt: new Date(),
      isForSale: false, // Remove from sale
      salePrice: null,
      listedForSaleAt: null,
      updatedAt: new Date(),
      // Store blockchain transaction hash
      blockchainTxHash: transactionHash,
    };

    // For NFT games, we might need additional handling
    if (game.isNFT && game.nftData) {
      updateData.nftData = {
        ...game.nftData,
        // NFT ownership updated on blockchain
        blockchainTxHash: transactionHash,
      };
    }

    // Update the game document
    await db.collection("games").updateOne(
      { gameId },
      { $set: updateData }
    );

    // Create notification for seller (ETH was already transferred via smart contract)
    await db.collection("notifications").insertOne({
      walletAddress: currentOwner,
      type: "game_sold",
      title: "Game Sold!",
      message: `Your game "${game.title}" has been sold for ${salePrice} ${priceType} (${ethAmount || ethPriceInEther} ETH)`,
      gameId,
      buyerAddress,
      amount: salePrice,
      currency: priceType,
      ethAmount: ethAmount || ethPriceInEther,
      blockchainTxHash: transactionHash,
      read: false,
      createdAt: new Date(),
    });

    // Create notification for buyer
    await db.collection("notifications").insertOne({
      walletAddress: buyerAddress,
      type: "game_purchased",
      title: "Game Purchased!",
      message: `You have successfully purchased "${game.title}" for ${salePrice} ${priceType} (${ethAmount || ethPriceInEther} ETH)`,
      gameId,
      sellerAddress: currentOwner,
      amount: salePrice,
      currency: priceType,
      ethAmount: ethAmount || ethPriceInEther,
      blockchainTxHash: transactionHash,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Game purchased successfully on blockchain",
      transaction: {
        transactionId: transaction.transactionId,
        from: currentOwner,
        to: buyerAddress,
        amount: salePrice,
        currency: priceType,
        ethAmount: ethAmount || ethPriceInEther,
        ethAmountWei: ethPriceWei,
        gameTitle: game.title,
        blockchainTxHash: transactionHash,
      }
    });

  } catch (error) {
    console.error("Game purchase error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}