import { PythPriceService } from './pyth-price-service';

/**
 * Test utility to verify which Pyth price feeds are working
 */
async function testPriceFeeds() {
  const service = new PythPriceService();
  const feeds = service.PRICE_FEEDS;
  
  console.log('Testing Pyth Price Feeds...');
  
  for (const [symbol, feedId] of Object.entries(feeds)) {
    try {
      const price = await service.getLatestPrice(feedId);
      console.log(`✅ ${symbol}: $${(Number(price.price.price) / Math.pow(10, -price.price.expo)).toFixed(2)}`);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`❌ ${symbol}: ${error.message}`);
      } else {
        console.log(`❌ ${symbol}: ${String(error)}`);
      }
    }
  }
}

// Test individual feeds to find working ones
async function testIndividualFeeds() {
  const service = new PythPriceService();
  
  // Test known working feeds
  const testFeeds = {
    ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    SOL_USD: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    USDC_USD: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  };
  
  for (const [symbol, feedId] of Object.entries(testFeeds)) {
    try {
      const price = await service.getLatestPrice(feedId);
      console.log(`✅ ${symbol}: Working - $${(Number(price.price.price) / Math.pow(10, -price.price.expo)).toFixed(2)}`);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`❌ ${symbol}: Failed - ${error.message}`);
      } else {
        console.log(`❌ ${symbol}: Failed - ${String(error)}`);
      }
    }
  }
}

export { testPriceFeeds, testIndividualFeeds };