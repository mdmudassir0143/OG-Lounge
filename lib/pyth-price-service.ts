import { HermesClient } from '@pythnetwork/hermes-client';

/**
 * Pyth Network Price Service
 * Handles real-time price feed integration for the gaming platform
 */
export class PythPriceService {
  private hermesClient: HermesClient;
  
  // Price feed IDs for various assets (Verified working feeds)
  public readonly PRICE_FEEDS = {
    ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    SOL_USD: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    AVAX_USD: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
    USDC_USD: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  };

  constructor(
    private readonly endpoint: string = 'https://hermes.pyth.network'
  ) {
    this.hermesClient = new HermesClient(endpoint);
  }

  /**
   * Get the latest price for a specific price feed
   * @param priceId The price feed ID
   * @returns Latest price data
   */
  async getLatestPrice(priceId: string) {
    try {
      const priceUpdates = await this.hermesClient.getLatestPriceUpdates([priceId]);
      
      if (!priceUpdates.parsed || priceUpdates.parsed.length === 0) {
        throw new Error(`No price data found for feed: ${priceId}`);
      }

      const priceData = priceUpdates.parsed[0];
      
      return {
        id: priceData.id,
        price: {
          price: priceData.price.price,
          conf: priceData.price.conf,
          expo: priceData.price.expo,
          publishTime: priceData.price.publish_time,
        },
        publishTime: priceData.price.publish_time,
        confidence: priceData.price.conf,
      };
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  /**
   * Get ETH/USD price specifically
   * @returns ETH price in USD
   */
  async getETHPrice() {
    return this.getLatestPrice(this.PRICE_FEEDS.ETH_USD);
  }

  /**
   * Get multiple prices at once
   * @param priceIds Array of price feed IDs
   * @returns Array of price data
   */
  async getMultiplePrices(priceIds: string[]) {
    try {
      const priceUpdates = await this.hermesClient.getLatestPriceUpdates(priceIds);
      
      if (!priceUpdates.parsed) {
        throw new Error('No parsed price data received');
      }
      
      return priceUpdates.parsed.map((priceData: any) => ({
        id: priceData.id,
        price: {
          price: priceData.price.price,
          conf: priceData.price.conf,
          expo: priceData.price.expo,
          publishTime: priceData.price.publish_time,
        },
        publishTime: priceData.price.publish_time,
        confidence: priceData.price.conf,
      }));
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      throw error;
    }
  }

  /**
   * Get price update data for smart contract consumption
   * @param priceIds Array of price feed IDs to update
   * @returns Update data that can be sent to smart contracts
   */
  async getPriceUpdateData(priceIds: string[]): Promise<string[]> {
    try {
      const priceUpdates = await this.hermesClient.getLatestPriceUpdates(priceIds);
      
      if (!priceUpdates.binary || !priceUpdates.binary.data) {
        throw new Error('No binary price update data received');
      }
      
      return priceUpdates.binary.data;
    } catch (error) {
      console.error('Error getting price update data:', error);
      throw error;
    }
  }

  /**
   * Calculate game price in Wei based on USD price and current ETH price
   * @param usdPriceCents Price in USD cents (e.g., 500 = $5.00)
   * @returns Price in Wei (as string to avoid precision issues)
   */
  async calculateGamePriceInWei(usdPriceCents: number): Promise<string> {
    try {
      const ethPrice = await this.getETHPrice();
      
      // Convert ETH price to proper format
      // Pyth prices typically have 8 decimal places for crypto pairs
      const ethPriceNumber = Number(ethPrice.price.price) * Math.pow(10, ethPrice.price.expo);
      
      if (ethPriceNumber <= 0) {
        throw new Error('Invalid ETH price received');
      }

      // Convert USD cents to dollars and calculate Wei
      const usdDollars = usdPriceCents / 100;
      const priceInEth = usdDollars / ethPriceNumber;
      const priceInWei = priceInEth * Math.pow(10, 18);
      
      return Math.floor(priceInWei).toString();
    } catch (error) {
      console.error('Error calculating game price in Wei:', error);
      throw error;
    }
  }

  /**
   * Get price feed metadata
   * @param priceId Price feed ID
   * @returns Price feed metadata
   */
  async getPriceFeedMetadata(priceId: string) {
    try {
      // This would typically come from Pyth's API
      // For now, we'll return basic info based on known feeds
      const metadata = {
        [this.PRICE_FEEDS.ETH_USD]: {
          symbol: 'ETH/USD',
          baseSymbol: 'ETH',
          quoteSymbol: 'USD',
          description: 'Ethereum / US Dollar'
        },
        [this.PRICE_FEEDS.BTC_USD]: {
          symbol: 'BTC/USD',
          baseSymbol: 'BTC',
          quoteSymbol: 'USD',
          description: 'Bitcoin / US Dollar'
        },
        // Add more as needed
      };

      return metadata[priceId] || {
        symbol: 'UNKNOWN',
        baseSymbol: 'UNKNOWN',
        quoteSymbol: 'USD',
        description: 'Unknown Price Feed'
      };
    } catch (error) {
      console.error('Error getting price feed metadata:', error);
      throw error;
    }
  }

  /**
   * Subscribe to price updates (for real-time UI updates)
   * @param priceIds Array of price feed IDs
   * @param callback Function to call when prices update
   * @returns Cleanup function to unsubscribe
   */
  async subscribeToPriceUpdates(
    priceIds: string[], 
    callback: (prices: any[]) => void
  ): Promise<() => void> {
    // Create a polling mechanism for price updates
    const interval = setInterval(async () => {
      try {
        const prices = await this.getMultiplePrices(priceIds);
        callback(prices);
      } catch (error) {
        console.error('Error in price subscription:', error);
      }
    }, 5000); // Update every 5 seconds

    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  }

  /**
   * Format price for display
   * @param price Price object from Pyth
   * @param decimals Number of decimal places to show
   * @returns Formatted price string
   */
  formatPrice(price: any, decimals: number = 2): string {
    try {
      const priceNumber = Number(price.price) * Math.pow(10, price.expo);
      return priceNumber.toFixed(decimals);
    } catch (error) {
      console.error('Error formatting price:', error);
      return 'N/A';
    }
  }

  /**
   * Check if price is stale
   * @param publishTime Publish time from price feed
   * @param maxAgeSeconds Maximum acceptable age in seconds
   * @returns True if price is stale
   */
  isPriceStale(publishTime: number, maxAgeSeconds: number = 60): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return (currentTime - publishTime) > maxAgeSeconds;
  }

  /**
   * Get price confidence interval
   * @param price Price object from Pyth
   * @returns Confidence interval as percentage
   */
  getPriceConfidence(price: any): number {
    try {
      const priceValue = Math.abs(Number(price.price) * Math.pow(10, price.expo));
      const confidence = Number(price.conf) * Math.pow(10, price.expo);
      
      if (priceValue === 0) return 0;
      
      return (confidence / priceValue) * 100;
    } catch (error) {
      console.error('Error calculating price confidence:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const pythPriceService = new PythPriceService();

// Helper types for TypeScript
export interface PriceData {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publishTime: number;
  };
  publishTime: number;
  confidence: string;
}

export interface GamePriceCalculation {
  usdPriceCents: number;
  ethPriceUsd: number;
  priceInWei: string;
  priceInEth: number;
  lastUpdated: number;
}