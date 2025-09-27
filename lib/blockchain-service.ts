import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "./contracts";

// Game Marketplace Contract ABI
const GAME_MARKETPLACE_ABI = [
  // Core functions
  "function createGame(string memory title, string memory description, uint256 priceUSD) external returns (uint256)",
  "function purchaseGame(uint256 gameId, bytes[] calldata priceUpdateData) external payable",
  "function listGameForSale(uint256 gameId, uint256 priceUSD) external",
  "function delistGame(uint256 gameId) external",
  
  // View functions
  "function getGame(uint256 gameId) external view returns (tuple(string title, string description, address owner, address creator, uint256 priceUSD, bool isListed, uint256 createdAt))",
  "function getCurrentPriceInETH(uint256 gameId) external view returns (uint256)",
  "function isOwner(uint256 gameId, address account) external view returns (bool)",
  "function getOwnerGames(address owner) external view returns (uint256[])",
  "function totalGames() external view returns (uint256)",
  
  // Events
  "event GameCreated(uint256 indexed gameId, address indexed creator, string title, uint256 priceUSD)",
  "event GamePurchased(uint256 indexed gameId, address indexed buyer, address indexed seller, uint256 paidAmount)",
  "event GameListed(uint256 indexed gameId, uint256 priceUSD)",
  "event GameDelisted(uint256 indexed gameId)",
  
  // Owner functions
  "function setPlatformFee(uint256 _fee) external",
  "function setPlatformWallet(address _wallet) external",
  "function withdraw() external"
];

// Simple Game struct for blockchain
export interface BlockchainGame {
  gameId: string;
  title: string;
  description: string;
  owner: string;
  creator: string;
  priceUSD: string;
  isListed: boolean;
  createdAt: string;
  priceInETH?: string;
}

export interface CreateGameParams {
  title: string;
  description: string;
  priceUSD: number;
}

export interface PurchaseGameResult {
  transactionHash: string;
  gameId: string;
  buyer: string;
  seller: string;
  paidAmount: string;
  paidAmountETH: string;
}

/**
 * Blockchain service for interacting with the Game Marketplace smart contract
 */
export class BlockchainService {
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;

  constructor(provider?: ethers.BrowserProvider | ethers.JsonRpcProvider) {
    // Use provided provider or create a default one for Sepolia
    if (provider) {
      this.provider = provider;
    } else {
      // Default to 0G testnet
      this.provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL || "https://evmrpc-testnet.0g.ai"
      );
    }

    // Initialize contract with provider
    this.contract = new ethers.Contract(
      this.getContractAddress(),
      GAME_MARKETPLACE_ABI,
      this.provider
    );
  }

  /**
   * Connect wallet and get signer
   */
  async connectWallet(walletProvider: any): Promise<void> {
    if (walletProvider) {
      this.provider = new ethers.BrowserProvider(walletProvider);
      this.signer = await this.provider.getSigner();
      
      // Update contract with signer for transactions
      this.contract = new ethers.Contract(
        this.getContractAddress(),
        GAME_MARKETPLACE_ABI,
        this.signer
      );
    }
  }

  /**
   * Create a new game on the blockchain
   */
  async createGame(params: CreateGameParams): Promise<{
    gameId: string;
    transactionHash: string;
  }> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const tx = await this.contract.createGame(
        params.title,
        params.description,
        params.priceUSD * 100 // Convert to cents
      );

      const receipt = await tx.wait();
      
      // Parse the GameCreated event to get the game ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsedEvent = this.contract.interface.parseLog(log);
          return parsedEvent?.name === "GameCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = this.contract.interface.parseLog(event);
        const gameId = parsedEvent?.args[0].toString();
        
        return {
          gameId,
          transactionHash: receipt.hash
        };
      }

      throw new Error("Game creation event not found");
    } catch (error) {
      console.error("Failed to create game on blockchain:", error);
      throw error;
    }
  }

  /**
   * Purchase a game on the blockchain
   */
  async purchaseGame(
    gameId: string,
    priceUpdateData: string[] = []
  ): Promise<PurchaseGameResult> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      // Get current price in ETH
      const priceInWei = await this.contract.getCurrentPriceInETH(gameId);
      
      // Add 5% buffer for price fluctuation
      const priceWithBuffer = (priceInWei * BigInt(105)) / BigInt(100);

      const tx = await this.contract.purchaseGame(
        gameId,
        priceUpdateData,
        {
          value: priceWithBuffer
        }
      );

      const receipt = await tx.wait();
      
      // Parse the GamePurchased event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsedEvent = this.contract.interface.parseLog(log);
          return parsedEvent?.name === "GamePurchased";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = this.contract.interface.parseLog(event);
        const [gameIdEvent, buyer, seller, paidAmount] = parsedEvent?.args || [];
        
        return {
          transactionHash: receipt.hash,
          gameId: gameIdEvent.toString(),
          buyer: buyer,
          seller: seller,
          paidAmount: paidAmount.toString(),
          paidAmountETH: ethers.formatEther(paidAmount)
        };
      }

      throw new Error("Game purchase event not found");
    } catch (error) {
      console.error("Failed to purchase game on blockchain:", error);
      throw error;
    }
  }

  /**
   * List a game for sale on the blockchain
   */
  async listGameForSale(gameId: string, priceUSD: number): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const tx = await this.contract.listGameForSale(
        gameId,
        priceUSD * 100 // Convert to cents
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error("Failed to list game for sale:", error);
      throw error;
    }
  }

  /**
   * Remove a game from sale on the blockchain
   */
  async delistGame(gameId: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const tx = await this.contract.delistGame(gameId);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error("Failed to delist game:", error);
      throw error;
    }
  }

  /**
   * Get game details from blockchain
   */
  async getGame(gameId: string): Promise<BlockchainGame> {
    try {
      const gameData = await this.contract.getGame(gameId);
      const priceInETH = await this.contract.getCurrentPriceInETH(gameId);
      
      return {
        gameId,
        title: gameData[0],
        description: gameData[1],
        owner: gameData[2],
        creator: gameData[3],
        priceUSD: (Number(gameData[4]) / 100).toString(), // Convert from cents
        isListed: gameData[5],
        createdAt: gameData[6].toString(),
        priceInETH: ethers.formatEther(priceInETH)
      };
    } catch (error) {
      console.error("Failed to get game from blockchain:", error);
      throw error;
    }
  }

  /**
   * Check if address is owner of a game
   */
  async isGameOwner(gameId: string, address: string): Promise<boolean> {
    try {
      return await this.contract.isOwner(gameId, address);
    } catch (error) {
      console.error("Failed to check game ownership:", error);
      return false;
    }
  }

  /**
   * Get games owned by an address
   */
  async getOwnerGames(address: string): Promise<string[]> {
    try {
      const gameIds = await this.contract.getOwnerGames(address);
      return gameIds.map((id: any) => id.toString());
    } catch (error) {
      console.error("Failed to get owner games:", error);
      return [];
    }
  }

  /**
   * Get current price in ETH for a game
   */
  async getCurrentPriceInETH(gameId: string): Promise<string> {
    try {
      const priceInWei = await this.contract.getCurrentPriceInETH(gameId);
      return ethers.formatEther(priceInWei);
    } catch (error) {
      console.error("Failed to get current ETH price:", error);
      throw error;
    }
  }

  /**
   * Get total number of games
   */
  async getTotalGames(): Promise<number> {
    try {
      const total = await this.contract.totalGames();
      return Number(total);
    } catch (error) {
      console.error("Failed to get total games:", error);
      return 0;
    }
  }

  /**
   * Get contract address
   */
  private getContractAddress(): string {
    // For development, use localhost. For production, use 0G testnet
    const chainId = process.env.NODE_ENV === "development" ? "localhost" : "0g-testnet";
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.GameMarketplace;
    
    if (!contractAddress) {
      throw new Error(
        `GameMarketplace contract address not found for chain: ${chainId}. Please check your environment configuration.`
      );
    }
    
    return contractAddress;
  }

  /**
   * Get public contract address
   */
  getPublicContractAddress(): string {
    return this.getContractAddress();
  }

  /**
   * Listen to contract events
   */
  onGamePurchased(callback: (event: any) => void): () => void {
    const eventFilter = this.contract.filters.GamePurchased();
    
    this.contract.on(eventFilter, callback);
    
    // Return unsubscribe function
    return () => {
      this.contract.off(eventFilter, callback);
    };
  }

  /**
   * Listen to game creation events
   */
  onGameCreated(callback: (event: any) => void): () => void {
    const eventFilter = this.contract.filters.GameCreated();
    
    this.contract.on(eventFilter, callback);
    
    // Return unsubscribe function
    return () => {
      this.contract.off(eventFilter, callback);
    };
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();