import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

/**
 * Simple on-chain randomness service for Rock Paper Scissors
 * Uses the latest block hash as a source of randomness
 */
export class SimpleRandomnessService {
  private publicClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http('https://sepolia.drpc.org'),
    });
  }

  /**
   * Get a random choice (1-3) using on-chain data
   * 1 = Rock, 2 = Paper, 3 = Scissors
   */
  async getRandomChoice(): Promise<number> {
    try {
      // Get the latest block
      const block = await this.publicClient.getBlock();

      // Use block hash as entropy source
      const blockHash = block.hash;

      // Convert hash to number and get 1-3
      const hashNumber = BigInt(blockHash);
      const randomChoice = Number(hashNumber % 3n) + 1;

      console.log('🔗 On-chain randomness used:', {
        blockNumber: block.number,
        blockHash: blockHash.slice(0, 10) + '...',
        randomChoice
      });

      return randomChoice;
    } catch (error) {
      console.error('Failed to get on-chain randomness:', error);
      // Fallback to Math.random if blockchain call fails
      return Math.floor(Math.random() * 3) + 1;
    }
  }

  /**
   * Convert number to choice string
   */
  numberToChoice(num: number): 'rock' | 'paper' | 'scissors' {
    switch (num) {
      case 1: return 'rock';
      case 2: return 'paper';
      case 3: return 'scissors';
      default: return 'rock';
    }
  }
}

// Singleton instance
export const simpleRandomnessService = new SimpleRandomnessService();