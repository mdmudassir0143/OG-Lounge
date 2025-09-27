import { NextRequest, NextResponse } from "next/server";
import { RealGameEncryption, IPFSStorageService } from "@/lib/real-encryption-service";

export async function POST(request: NextRequest) {
  try {
    const { gameCode, ownerAddress, gameTitle } = await request.json();

    if (!gameCode || !ownerAddress) {
      return NextResponse.json(
        { success: false, error: "Missing gameCode or ownerAddress" },
        { status: 400 }
      );
    }

    // Encrypt the game code
    const encryption = await RealGameEncryption.encryptGameCode(gameCode, ownerAddress);
    
    // Upload encrypted metadata to IPFS
    const ipfsResult = await IPFSStorageService.uploadEncryptedMetadata(
      encryption.encryptedData,
      encryption.metadataHash,
      gameTitle || 'Encrypted Game Code',
      ownerAddress
    );

    return NextResponse.json({
      success: true,
      data: {
        encryptedData: encryption.encryptedData,
        sealedKey: encryption.sealedKey,
        metadataHash: encryption.metadataHash,
        encryptedMetadataURI: ipfsResult.encryptedMetadataURI,
        ipfsHash: ipfsResult.ipfsHash,
        ipfsUrl: ipfsResult.ipfsUrl
      }
    });
  } catch (error) {
    console.error("Encryption API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}