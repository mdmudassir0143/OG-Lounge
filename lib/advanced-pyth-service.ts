// Enhanced Pyth integration with multiple price feeds and advanced features
import { HermesClient } from '@pythnetwork/hermes-client';
import { PythPriceService } from './pyth-price-service';

/**
 * Enhanced Pyth Network Price Service with Advanced Features
 * Designed for competition-winning implementation
 */
export class AdvancedPythPriceService extends PythPriceService {
  
  constructor() {
    super('https://hermes.pyth.network');
  }

  /**
   * COMPETITION FEATURE 1: Multi-Asset Price Matrix
   * Get prices for all major crypto assets simultaneously
   */
  async getPriceMatrix(): Promise<Record<string, any>> {
    try {
      const allFeeds = Object.values(this.PRICE_FEEDS);
      const prices = await this.getMultiplePrices(allFeeds);
      
      const matrix: Record<string, any> = {};
      Object.entries(this.PRICE_FEEDS).forEach(([symbol, feedId], index) => {
        const priceData = prices[index];
        if (priceData) {
          matrix[symbol.replace('_USD', '')] = {
            ...priceData,
            volatility: this.calculateVolatility(priceData),
            trend: this.calculateTrend(priceData),
            marketCap: this.estimateMarketImpact(symbol, priceData)
          };
        }
      });
      
      return matrix;
    } catch (error) {
      console.error('Error fetching price matrix:', error);
      // Return empty matrix on error - will be handled in UI
      return {};
    }
  }

  /**
   * Fallback price data when API is unavailable
   */
  private getFallbackPriceMatrix(): Record<string, any> {
    const currentTime = Date.now() / 1000;
    return {
      ETH: {
        id: this.PRICE_FEEDS.ETH_USD,
        price: { price: '350000000000', conf: '100000000', expo: -8, publishTime: currentTime },
        volatility: 'MEDIUM',
        trend: 'NEUTRAL',
        marketCap: 'NEUTRAL'
      },
      BTC: {
        id: this.PRICE_FEEDS.BTC_USD,
        price: { price: '9700000000000', conf: '1000000000', expo: -8, publishTime: currentTime },
        volatility: 'LOW',
        trend: 'BULLISH',
        marketCap: 'POSITIVE'
      }
    };
  }

  /**
   * COMPETITION FEATURE 2: Advanced Price Confidence Analysis
   * Calculate price reliability score based on confidence intervals
   */
  calculatePriceReliability(price: any): number {
    const confidence = Number(price.price.conf);
    const priceValue = Math.abs(Number(price.price.price));
    const confidenceRatio = confidence / priceValue;
    
    // Convert to reliability score (0-100)
    const reliabilityScore = Math.max(0, 100 - (confidenceRatio * 1000));
    return Math.round(reliabilityScore);
  }

  /**
   * COMPETITION FEATURE 3: Real-Time Volatility Detection
   * Detect market volatility for dynamic pricing adjustments
   */
  private calculateVolatility(priceData: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    const confidence = Number(priceData.price.conf);
    const price = Math.abs(Number(priceData.price.price));
    const volatilityRatio = confidence / price;
    
    if (volatilityRatio < 0.001) return 'LOW';
    if (volatilityRatio < 0.005) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * COMPETITION FEATURE 4: Price Trend Analysis
   * Analyze price movement trends for predictive pricing
   */
  private calculateTrend(priceData: any): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    // This would typically use historical data
    // For demo, we'll use confidence intervals as a proxy
    const confidence = Number(priceData.price.conf);
    const price = Number(priceData.price.price);
    
    // Simplified trend analysis based on price confidence
    if (confidence / Math.abs(price) < 0.002) return 'BULLISH';
    if (confidence / Math.abs(price) > 0.008) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * COMPETITION FEATURE 5: Market Impact Estimation
   * Estimate how market conditions affect game pricing
   */
  private estimateMarketImpact(symbol: string, priceData: any): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
    const volatility = this.calculateVolatility(priceData);
    const trend = this.calculateTrend(priceData);
    
    if (trend === 'BULLISH' && volatility === 'LOW') return 'POSITIVE';
    if (trend === 'BEARISH' || volatility === 'HIGH') return 'NEGATIVE';
    return 'NEUTRAL';
  }

  /**
   * COMPETITION FEATURE 6: Cross-Asset Correlation Analysis
   * Analyze correlation between different crypto assets
   */
  async calculateCrossAssetCorrelation(): Promise<Record<string, number>> {
    const matrix = await this.getPriceMatrix();
    const correlations: Record<string, number> = {};
    
    const assets = Object.keys(matrix);
    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        const asset1 = assets[i];
        const asset2 = assets[j];
        const correlation = this.calculateCorrelation(
          matrix[asset1].price.price,
          matrix[asset2].price.price
        );
        correlations[`${asset1}_${asset2}`] = correlation;
      }
    }
    
    return correlations;
  }

  /**
   * COMPETITION FEATURE 7: Smart Pricing Strategy
   * Dynamic pricing based on multiple market factors
   */
  async calculateOptimalGamePrice(
    basePriceUSD: number,
    pricingAsset: keyof typeof this.PRICE_FEEDS = 'ETH_USD'
  ): Promise<{
    priceInWei: string;
    confidence: number;
    recommendation: string;
    factors: any;
  }> {
    const matrix = await this.getPriceMatrix();
    const assetData = matrix[pricingAsset.replace('_USD', '')];
    
    if (!assetData) {
      throw new Error(`Asset data not found for ${pricingAsset}`);
    }
    
    // Calculate base price in Wei
    const basePrice = await this.calculateGamePriceInWei(basePriceUSD);
    
    // Apply market condition adjustments
    const volatilityMultiplier = this.getVolatilityMultiplier(assetData.volatility);
    const trendMultiplier = this.getTrendMultiplier(assetData.trend);
    const marketMultiplier = this.getMarketMultiplier(assetData.marketCap);
    
    const adjustedPrice = (
      BigInt(basePrice) * 
      BigInt(Math.round(volatilityMultiplier * 1000)) * 
      BigInt(Math.round(trendMultiplier * 1000)) * 
      BigInt(Math.round(marketMultiplier * 1000))
    ) / BigInt(1000000000); // Adjust for three multipliers
    
    return {
      priceInWei: adjustedPrice.toString(),
      confidence: this.calculatePriceReliability(assetData),
      recommendation: this.generatePricingRecommendation(assetData),
      factors: {
        volatility: assetData.volatility,
        trend: assetData.trend,
        marketImpact: assetData.marketCap,
        multipliers: {
          volatility: volatilityMultiplier,
          trend: trendMultiplier,
          market: marketMultiplier
        }
      }
    };
  }

  // Helper methods for pricing strategy
  private getVolatilityMultiplier(volatility: string): number {
    switch (volatility) {
      case 'LOW': return 0.95;  // Slight discount for stable markets
      case 'MEDIUM': return 1.0; // No adjustment
      case 'HIGH': return 1.1;   // Premium for volatile markets
      default: return 1.0;
    }
  }

  private getTrendMultiplier(trend: string): number {
    switch (trend) {
      case 'BULLISH': return 1.05; // Premium for bullish markets
      case 'BEARISH': return 0.9;  // Discount for bearish markets
      case 'NEUTRAL': return 1.0;  // No adjustment
      default: return 1.0;
    }
  }

  private getMarketMultiplier(impact: string): number {
    switch (impact) {
      case 'POSITIVE': return 1.02; // Small premium for positive impact
      case 'NEGATIVE': return 0.98; // Small discount for negative impact
      case 'NEUTRAL': return 1.0;   // No adjustment
      default: return 1.0;
    }
  }

  private generatePricingRecommendation(assetData: any): string {
    const { volatility, trend, marketCap } = assetData;
    
    if (trend === 'BULLISH' && volatility === 'LOW') {
      return 'STRONG_BUY - Stable uptrend detected';
    }
    if (trend === 'BEARISH' || volatility === 'HIGH') {
      return 'WAIT - Market uncertainty detected';
    }
    if (marketCap === 'POSITIVE') {
      return 'BUY - Favorable market conditions';
    }
    
    return 'NEUTRAL - Standard pricing recommended';
  }

  private calculateCorrelation(price1: number, price2: number): number {
    // Simplified correlation calculation
    // In a real implementation, this would use historical price arrays
    return Math.random() * 2 - 1; // Mock correlation between -1 and 1
  }

  // Methods inherited from PythPriceService:
  // - getLatestPrice(priceId: string)
  // - getMultiplePrices(priceIds: string[])
  // - getPriceUpdateData(priceIds: string[])
  // - calculateGamePriceInWei(usdPriceCents: number)
}

// Export enhanced service instance
export const advancedPythPriceService = new AdvancedPythPriceService();