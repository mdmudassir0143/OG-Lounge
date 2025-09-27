import { NextRequest, NextResponse } from "next/server";
import { RealGameEncryption, IPFSStorageService } from "@/lib/real-encryption-service";
import client from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { tokenId, ownerAddress } = await request.json();

    if (!tokenId || !ownerAddress) {
      return NextResponse.json(
        { success: false, error: "Missing tokenId or ownerAddress" },
        { status: 400 }
      );
    }
    
    await client.connect();
    const db = client.db("game-hub");

    // Find the NFT game in our database
    const game = await db.collection("games").findOne({
      "nftData.tokenId": tokenId,
      walletAddress: ownerAddress,  // Fixed: use walletAddress instead of wallet
      isNFT: true
    });

    if (!game) {
      return NextResponse.json(
        { success: false, error: "NFT game not found or not owned by this address" },
        { status: 404 }
      );
    }

    // Get the encrypted metadata from the NFT data
    const { encryptedMetadataURI } = game.nftData;
    
    if (!encryptedMetadataURI) {
      return NextResponse.json(
        { success: false, error: "No encrypted metadata found for this NFT" },
        { status: 404 }
      );
    }

    // For this demo, we'll return the original HTML from the database
    // In a real implementation, you would decrypt it from IPFS using the sealed key
    const latestVersion = game.versions?.at(-1);
    if (!latestVersion) {
      return NextResponse.json(
        { success: false, error: "No game version found" },
        { status: 404 }
      );
    }

    // TODO: In production, decrypt using the sealed key from contract
    // const sealedKey = await contract.getSealedKey(tokenId);
    // const decryptedCode = await GameEncryption.decryptGameCode(
    //   encryptedMetadataURI,
    //   sealedKey,
    //   ownerAddress
    // );

    return NextResponse.json({
      success: true,
      gameCode: latestVersion.html, // In production, this would be the decrypted code
      title: game.title,
      description: latestVersion.description,
      encryptedMetadataURI,
      ipfsHash: game.nftData?.ipfsHash || game.nftData?.metadataHash // Use available hash field
    });
  } catch (error) {
    console.error("Error decrypting game:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    // Ensure proper connection cleanup
    await client.close();
  }
}