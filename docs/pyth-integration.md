# Pyth Network Integration Guide

## Overview
This guide explains how to integrate Pyth Network's real-time price feeds into the Gamie platform for dynamic game pricing.

## Smart Contract Integration

### 1. Deployed Contracts
- **GameEconomy.sol**: Core contract with Pyth price feed integration
- **GameMarketplace.sol**: Extended marketplace with auctions and bundles
- **Pyth Contract**: `0x4305FB66699C3B2702D4d05CF36551390A4c69C6` (Sepolia)

### 2. Key Features
- Real-time ETH/USD price feeds from Pyth Network
- Dynamic game pricing based on market conditions
- Secure price updates with cryptographic verification
- Platform fee structure (2.5%)

## Frontend Integration

### 1. Price Service (`lib/pyth-price-service.ts`)
```typescript
import { pythPriceService } from '@/lib/pyth-price-service';

// Get current ETH price
const ethPrice = await pythPriceService.getETHPrice();

// Calculate game price in Wei
const priceInWei = await pythPriceService.calculateGamePriceInWei(500); // $5.00

// Get price update data for smart contract
const updateData = await pythPriceService.getPriceUpdateData([
  pythPriceService.PRICE_FEEDS.ETH_USD
]);
```

### 2. React Component (`components/pyth/PythGamePricing.tsx`)
```typescript
import { PythGamePricing } from '@/components/pyth/PythGamePricing';

<PythGamePricing
  gameId="1"
  basePriceUSD={500} // $5.00 in cents
  contractAddress="0x..."
  onPurchaseComplete={() => console.log('Purchase complete')}
/>
```

## Deployment Process

### 1. Environment Setup
```bash
# Navigate to hardhat directory
cd hardhat

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Fill in SEPOLIA_PRIVATE_KEY, SEPOLIA_RPC_URL, MAINNET_RPC_URL, etc.
```

### 2. Contract Deployment
```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat ignition deploy ./ignition/modules/GameMarketplace.ts --network sepolia

# Deploy to Mainnet (when ready)
npx hardhat ignition deploy ./ignition/modules/GameMarketplace.ts --network mainnet
```

### 3. Verification
```bash
# Verify contracts on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Price Feed Configuration

### 1. Supported Price Feeds
- **ETH/USD**: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`
- **BTC/USD**: `0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43`
- **SOL/USD**: `0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`

### 2. Price Update Process
1. **Fetch Data**: Get latest price data from Hermes API
2. **Update On-Chain**: Call `updatePriceFeeds()` with update data
3. **Consume Price**: Read updated price using `getPriceUnsafe()`

## Usage Examples

### 1. Register a Game
```typescript
const gameEconomy = new Contract(contractAddress, abi, signer);

const tx = await gameEconomy.registerGame(
  "QmIPFSHash123", // IPFS metadata hash
  500 // $5.00 in cents
);
```

### 2. Purchase with Dynamic Pricing
```typescript
// Get price update data
const updateData = await pythPriceService.getPriceUpdateData([ETH_USD_FEED]);

// Purchase game
const tx = await gameEconomy.purchaseGame(
  gameId,
  updateData,
  { value: totalPriceWithFees }
);
```

### 3. Create an Auction
```typescript
const gameMarketplace = new Contract(marketplaceAddress, abi, signer);

const tx = await gameMarketplace.createAuction(
  gameId,
  parseEther("0.1"), // Starting bid in Wei
  7 * 24 * 60 * 60 // 7 days duration
);
```

## Error Handling

### 1. Common Issues
- **Stale Prices**: Check `publishTime` and use `getPriceNoOlderThan()`
- **Update Fees**: Always include sufficient ETH for Pyth update fees
- **Price Confidence**: Monitor confidence intervals for price accuracy

### 2. Retry Logic
```typescript
const maxRetries = 3;
let retries = 0;

while (retries < maxRetries) {
  try {
    const price = await pythPriceService.getETHPrice();
    break;
  } catch (error) {
    retries++;
    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
  }
}
```

## Security Considerations

### 1. Price Validation
- Always validate price freshness (`publishTime`)
- Check confidence intervals for accuracy
- Implement circuit breakers for extreme price movements

### 2. Access Control
- Only game owners can modify game prices
- Platform admin controls for emergency situations
- Multi-signature for critical parameter changes

### 3. Fee Management
- Monitor Pyth update fees dynamically
- Implement fee buffers for transaction success
- Regular fee optimization reviews

## Testing

### 1. Unit Tests
```bash
cd hardhat
npx hardhat test
```

### 2. Integration Tests
```bash
# Test with mock Pyth data
npx hardhat test --network hardhat

# Test on Sepolia testnet
npx hardhat test --network sepolia
```

### 3. Price Feed Testing
```typescript
// Test price fetching
const price = await pythPriceService.getETHPrice();
console.log('ETH Price:', pythPriceService.formatPrice(price.price));

// Test price staleness
const isStale = pythPriceService.isPriceStale(price.publishTime, 60);
console.log('Is price stale:', isStale);
```

## Monitoring & Analytics

### 1. Price Tracking
- Monitor price update frequency
- Track price deviation from external sources
- Alert on stale or invalid prices

### 2. Game Economics
- Track game price volatility
- Monitor purchase patterns vs price changes
- Analyze revenue impact of dynamic pricing

### 3. System Health
- Monitor Pyth Network uptime
- Track update fee costs
- System latency metrics

## Next Steps

### 1. Advanced Features
- Multi-asset pricing (BTC, SOL, etc.)
- Volatility-based pricing adjustments
- Time-decay pricing models
- Bulk price updates for gas optimization

### 2. UI/UX Enhancements
- Real-time price charts
- Price history visualization
- Price alerts and notifications
- Mobile-optimized pricing displays

### 3. Integration Expansion
- Cross-chain price feeds
- DeFi protocol integrations
- Automated market makers for games
- Liquidity pools for game tokens

## Support & Resources

- **Pyth Documentation**: https://docs.pyth.network/
- **Discord Support**: https://discord.gg/PythNetwork
- **GitHub Repository**: https://github.com/pyth-network/pyth-evm
- **Price Feed Explorer**: https://pyth.network/price-feeds