import { NextRequest, NextResponse } from "next/server";
import { RealGameEncryption, IPFSStorageService } from "@/lib/real-encryption-service";

export async function POST(request: NextRequest) {
  try {
    const { encryptedMetadataURI, sealedKey, ownerAddress } = await request.json();

    if (!encryptedMetadataURI || !sealedKey || !ownerAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Extract IPFS hash from URI
    const ipfsHash = encryptedMetadataURI.replace('ipfs://', '');
    
    // Retrieve encrypted metadata from IPFS
    const metadata = await IPFSStorageService.retrieveEncryptedMetadata(ipfsHash);
    
    // Unseal the encryption key
    const encryptionKey = await RealGameEncryption.unsealEncryptionKey(sealedKey, ownerAddress);
    
    // Decrypt the game code
    const decryptedCode = await RealGameEncryption.decryptGameCode(metadata.encryptedGameCode, encryptionKey);

    return NextResponse.json({
      success: true,
      decryptedCode
    });
  } catch (error) {
    console.error("Decryption API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}