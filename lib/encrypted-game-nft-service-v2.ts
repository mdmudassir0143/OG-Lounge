import { ethers } from 'ethers';
import { HermesClient } from '@pythnetwork/hermes-client';

// Deployed Contract Addresses
const CONTRACT_ADDRESSES = {
  16602: '0xb107f6825aE9E71dF31c27e23547813F4bDd7411', // 0G Testnet - Primary
  11155111: '0xC08F8713412CD1097DbaFb284dFB856E634712C6', // Sepolia
  1: '0x0000000000000000000000000000000000000000', // Mainnet (to be deployed)
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Localhost
};

// Contract ABI
const ENCRYPTED_GAME_NFT_ABI = [
  "function mintGameNFT(string title, string description, uint256 priceUSD, string encryptedMetadataURI, bytes32 metadataHash, uint256 royaltyPercentage) external returns (uint256)",
  "function purchaseGame(uint256 tokenId, bytes[] priceUpdateData, bytes sealedKey, bytes transferProof) external payable",
  "function listOnMarketplace(uint256 tokenId, uint256 customPriceUSD) external",
  "function delistFromMarketplace(uint256 tokenId) external",
  "function grantTemporaryAccess(uint256 tokenId, address user, uint256 duration) external",
  "function getGameDetails(uint256 tokenId) external view returns (tuple(string title, string description, address creator, address currentOwner, uint256 priceUSD, bool isListed, uint256 createdAt, uint256 royaltyPercentage, uint256 earnings))",
  "function getEncryptedMetadata(uint256 tokenId) external view returns (string encryptedMetadataURI, bytes32 metadataHash)",
  "function getSealedKey(uint256 tokenId) external view returns (bytes)",
  "function hasMetadataAccess(uint256 tokenId, address user) external view returns (bool)",
  "function getCreatorGames(address creator) external view returns (uint256[])",
  "function getCurrentPriceInETH(uint256 tokenId) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "event GameNFTMinted(uint256 indexed tokenId, address indexed creator, string title, uint256 priceUSD, string encryptedMetadataURI)",
  "event GamePurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 paidAmount, bytes32 transferProofHash)",
  "event GameListed(uint256 indexed tokenId, uint256 priceUSD)",
  "event AccessGranted(uint256 indexed tokenId, address indexed user, uint256 expirationTime)"
];

// Types
export interface GameNFTDetails {
  title: string;
  description: string;
  creator: string;
  currentOwner: string;
  priceUSD: number;
  isListed: boolean;
  createdAt: number;
  royaltyPercentage: number;
  earnings: string;
  priceInETH?: string;
  tokenId: string;
}

export interface EncryptedMetadata {
  encryptedMetadataURI: string;
  metadataHash: string;
}

export interface MintGameNFTParams {
  title: string;
  description: string;
  priceUSD: number;
  gameCode: string;
  royaltyPercentage: number;
}

export interface PurchaseGameParams {
  tokenId: string;
  buyerAddress: string;
}

export interface MintResult {
  tokenId: string;
  transactionHash: string;
  encryptedMetadataURI: string;
  metadataHash: string;
  ipfsHash: string;
  sealedKey: string;
}

/**
 * Encryption utilities for game content (now using real encryption)
 */
export class GameEncryption {
  /**
   * Encrypt game code for secure storage (client-side API call)
   */
  static async encryptGameCode(
    gameCode: string,
    ownerAddress: string,
    gameTitle?: string
  ): Promise<{
    encryptedData: string;
    sealedKey: string;
    metadataHash: string;
    encryptedMetadataURI: string;
    ipfsHash: string;
  }> {
    try {
      // Call server-side encryption API
      const response = await fetch('/api/encrypted-nfts/encrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameCode,
          ownerAddress,
          gameTitle: gameTitle || 'Encrypted Game Code'
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to encrypt game code');
      }

      return result.data;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt game code');
    }
  }

  /**
   * Decrypt game code for owner (client-side API call)
   */
  static async decryptGameCode(
    encryptedMetadataURI: string,
    sealedKey: string,
    ownerAddress: string
  ): Promise<string> {
    try {
      // Call server-side decryption API
      const response = await fetch('/api/encrypted-nfts/decrypt-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedMetadataURI,
          sealedKey,
          ownerAddress
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to decrypt game code');
      }

      return result.decryptedCode;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt game code');
    }
  }
}

/**
 * Service for interacting with EncryptedGameNFT contract
 */
export class EncryptedGameNFTService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(
    provider: ethers.Provider,
    signer?: ethers.Signer,
    chainId?: number
  ) {
    this.provider = provider;
    this.signer = signer;
    
    // Get contract address based on network
    const networkChainId = chainId || 16602; // Default to 0G testnet
    const contractAddress = CONTRACT_ADDRESSES[networkChainId as keyof typeof CONTRACT_ADDRESSES];
    
    if (!contractAddress) {
      throw new Error(`EncryptedGameNFT contract not deployed on network ${networkChainId}`);
    }
    
    this.contract = new ethers.Contract(
      contractAddress,
      ENCRYPTED_GAME_NFT_ABI,
      signer || provider
    );
  }

  /**
   * Get contract address for current network
   */
  getContractAddress(): string {
    return this.contract.target as string;
  }

  /**
   * Mint a new encrypted game NFT
   */
  async mintEncryptedGame(params: MintGameNFTParams): Promise<MintResult> {
    if (!this.signer) {
      throw new Error('Signer required for minting');
    }

    try {
      // Encrypt the game code and upload to IPFS
      const ownerAddress = await this.signer.getAddress();
      const encrypted = await GameEncryption.encryptGameCode(
        params.gameCode,
        ownerAddress,
        params.title
      );

      console.log('Minting game NFT with params:', {
        title: params.title,
        description: params.description,
        priceUSD: params.priceUSD,
        encryptedMetadataURI: encrypted.encryptedMetadataURI,
        metadataHash: encrypted.metadataHash,
        royaltyPercentage: params.royaltyPercentage,
        ipfsHash: encrypted.ipfsHash
      });

      const tx = await this.contract.mintGameNFT(
        params.title,
        params.description,
        params.priceUSD,
        encrypted.encryptedMetadataURI,
        encrypted.metadataHash,
        params.royaltyPercentage
      );

      const receipt = await tx.wait();
      console.log('Mint transaction receipt:', receipt);

      // Extract token ID from events
      const events = receipt.logs || [];
      let tokenId: string | null = null;
      
      for (const event of events) {
        try {
          const parsedEvent = this.contract.interface.parseLog(event);
          if (parsedEvent && parsedEvent.name === 'GameNFTMinted') {
            tokenId = parsedEvent.args.tokenId.toString();
            break;
          }
        } catch (e) {
          // Skip unparseable events
        }
      }

      if (!tokenId) {
        throw new Error('TokenId not found in transaction receipt');
      }

      // Return comprehensive minting data
      return {
        tokenId,
        transactionHash: receipt.hash,
        encryptedMetadataURI: encrypted.encryptedMetadataURI,
        metadataHash: encrypted.metadataHash,
        ipfsHash: encrypted.ipfsHash,
        sealedKey: encrypted.sealedKey
      };
    } catch (error: any) {
      console.error('Mint failed:', error);
      throw new Error(`Failed to mint encrypted game NFT: ${error.message}`);
    }
  }

  /**
   * Purchase an encrypted game NFT
   */
  async purchaseEncryptedGame(params: PurchaseGameParams): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for purchasing');
    }

    try {
      // Get current price in ETH
      const priceInWei = await this.contract.getCurrentPriceInETH(params.tokenId);
      
      // Create mock price update data (in production, get from Pyth)
      const priceUpdateData: string[] = [];
      
      // Create mock sealed key for buyer
      const sealedKey = ethers.toUtf8Bytes('sealed_key_' + params.buyerAddress);
      
      // Create mock transfer proof
      const transferProof = ethers.toUtf8Bytes('mock_proof_' + Date.now());

      const tx = await this.contract.purchaseGame(
        params.tokenId,
        priceUpdateData,
        sealedKey,
        transferProof,
        { value: priceInWei }
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      console.error('Purchase failed:', error);
      throw new Error(`Failed to purchase game: ${error.message}`);
    }
  }

  /**
   * Get game details by token ID
   */
  async getGameDetails(tokenId: string): Promise<GameNFTDetails | null> {
    try {
      // First check if token exists by checking owner
      const owner = await this.contract.ownerOf(tokenId);
      if (!owner || owner === ethers.ZeroAddress) {
        return null;
      }

      const details = await this.contract.getGameDetails(tokenId);
      const priceInWei = await this.contract.getCurrentPriceInETH(tokenId);

      return {
        title: details.title,
        description: details.description,
        creator: details.creator,
        currentOwner: details.currentOwner,
        priceUSD: Number(details.priceUSD),
        isListed: details.isListed,
        createdAt: Number(details.createdAt),
        royaltyPercentage: Number(details.royaltyPercentage),
        earnings: ethers.formatEther(details.earnings),
        priceInETH: ethers.formatEther(priceInWei),
        tokenId
      };
    } catch (error) {
      console.error('Failed to get game details:', error);
      return null;
    }
  }

  /**
   * Get encrypted metadata (only for owners/authorized users)
   */
  async getEncryptedMetadata(tokenId: string): Promise<EncryptedMetadata | null> {
    try {
      const metadata = await this.contract.getEncryptedMetadata(tokenId);
      return {
        encryptedMetadataURI: metadata.encryptedMetadataURI,
        metadataHash: metadata.metadataHash
      };
    } catch (error) {
      console.error('Failed to get encrypted metadata:', error);
      return null;
    }
  }

  /**
   * Decrypt game code for owner
   */
  async decryptGameCode(tokenId: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for decryption');
    }

    try {
      const ownerAddress = await this.signer.getAddress();
      const sealedKey = await this.contract.getSealedKey(tokenId);
      const metadata = await this.getEncryptedMetadata(tokenId);
      
      if (!metadata) {
        throw new Error('No metadata found');
      }

      // For demo, reverse the encryption process
      return GameEncryption.decryptGameCode(
        metadata.encryptedMetadataURI,
        ethers.toUtf8String(sealedKey),
        ownerAddress
      );
    } catch (error: any) {
      console.error('Decryption failed:', error);
      throw new Error(`Failed to decrypt game code: ${error.message}`);
    }
  }

  /**
   * List game on marketplace
   */
  async listOnMarketplace(tokenId: string, priceUSD: number): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for listing');
    }

    try {
      const tx = await this.contract.listOnMarketplace(tokenId, priceUSD);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      console.error('Listing failed:', error);
      throw new Error(`Failed to list on marketplace: ${error.message}`);
    }
  }

  /**
   * Delist game from marketplace
   */
  async delistFromMarketplace(tokenId: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for delisting');
    }

    try {
      const tx = await this.contract.delistFromMarketplace(tokenId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error: any) {
      console.error('Delisting failed:', error);
      throw new Error(`Failed to delist from marketplace: ${error.message}`);
    }
  }

  /**
   * Get games created by an address
   */
  async getCreatorGames(creatorAddress: string): Promise<GameNFTDetails[]> {
    try {
      const tokenIds = await this.contract.getCreatorGames(creatorAddress);
      const games: GameNFTDetails[] = [];

      for (const tokenId of tokenIds) {
        const details = await this.getGameDetails(tokenId.toString());
        if (details) {
          games.push(details);
        }
      }

      return games;
    } catch (error) {
      console.error('Failed to get creator games:', error);
      return [];
    }
  }

  /**
   * Get total supply of NFTs
   */
  async getTotalSupply(): Promise<number> {
    try {
      const supply = await this.contract.totalSupply();
      return Number(supply);
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return 0;
    }
  }

  /**
   * Check if user has access to metadata
   */
  async hasMetadataAccess(tokenId: string, userAddress: string): Promise<boolean> {
    try {
      return await this.contract.hasMetadataAccess(tokenId, userAddress);
    } catch (error) {
      console.error('Failed to check metadata access:', error);
      return false;
    }
  }
}

/**
 * Create service instance with provider and optional signer
 */
export function createEncryptedGameNFTService(
  provider: ethers.Provider,
  signer?: ethers.Signer
): EncryptedGameNFTService {
  return new EncryptedGameNFTService(provider, signer);
}