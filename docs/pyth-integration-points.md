# 🎯 Pyth Service Integration Guide

## 📍 **5 Key Integration Points for Pyth Service**

### 1. **Game Card Component** - Dynamic Price Display
**File**: `components/ui/game-card.tsx`
**Purpose**: Show real-time ETH prices for games in marketplace

```tsx
// Add to imports
import { PythGamePricing } from '@/components/pyth/PythGamePricing';

// Replace static price with dynamic Pyth pricing
<PythGamePricing
  gameId={game.id}
  basePriceUSD={game.price * 100} // Convert to cents
  contractAddress="0x5FbDB2315678afecb367f032d93F642f64180aa3" // Your deployed contract
  onPurchaseComplete={() => onBuy?.(game.id, game.price)}
/>
```

### 2. **Buy Game Dialog** - Real-time Purchase
**File**: `components/ui/buy-game-dialog.tsx` 
**Purpose**: Replace static pricing with dynamic Pyth-powered purchases

```tsx
// Replace the entire dialog content with:
import { PythGamePricing } from '@/components/pyth/PythGamePricing';

// In the dialog content:
<PythGamePricing
  gameId={gameId}
  basePriceUSD={price * 100}
  contractAddress={CONTRACT_ADDRESS}
  onPurchaseComplete={() => {
    setOpen(false);
    toast.success("Game purchased successfully!");
  }}
/>
```

### 3. **Marketplace Page** - Live Price Updates
**File**: `app/(auth)/marketplace/page.tsx`
**Purpose**: Show live price updates across all games

```tsx
// Add real-time price monitoring
import { pythPriceService } from '@/lib/pyth-price-service';

// Add this effect for live updates
React.useEffect(() => {
  const unsubscribe = pythPriceService.subscribeToPriceUpdates(
    [pythPriceService.PRICE_FEEDS.ETH_USD],
    (prices) => {
      // Update game prices in real-time
      console.log('ETH Price updated:', prices[0]);
    }
  );

  return () => {
    unsubscribe.then(cleanup => cleanup());
  };
}, []);
```

### 4. **Game Detail Page** - Advanced Pricing
**File**: `app/(auth)/marketplace/[id]/page.tsx`
**Purpose**: Detailed price analysis and purchase interface

```tsx
// Full integration with price history and confidence
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div>
    {/* Game details */}
  </div>
  <div>
    <PythGamePricing
      gameId={params.id}
      basePriceUSD={game.price * 100}
      contractAddress={CONTRACT_ADDRESS}
      onPurchaseComplete={() => router.push('/games')}
    />
  </div>
</div>
```

### 5. **Sell Game Dialog** - Dynamic Listing
**File**: `components/canvas-forge/sell-game-dialog.tsx`
**Purpose**: Help sellers set competitive USD prices

```tsx
// Add price suggestion based on current ETH price
import { pythPriceService } from '@/lib/pyth-price-service';

const [suggestedPrice, setSuggestedPrice] = useState<number>(0);

React.useEffect(() => {
  const getSuggestedPrice = async () => {
    const ethPrice = await pythPriceService.getETHPrice();
    const formattedPrice = pythPriceService.formatPrice(ethPrice.price);
    // Suggest pricing based on current ETH value
    setSuggestedPrice(parseFloat(formattedPrice) * 0.001); // Suggest 0.001 ETH worth
  };
  getSuggestedPrice();
}, []);
```

## 🚀 **Implementation Priority**

### **Phase 1: Critical Integration (Do First)**
1. **Game Card Component** - Most visible impact
2. **Buy Game Dialog** - Core purchase functionality
3. **Marketplace Page** - Live price feeds

### **Phase 2: Enhanced Features**
4. **Game Detail Page** - Advanced pricing UI
5. **Sell Game Dialog** - Pricing suggestions

## 📝 **Step-by-Step Implementation**

### Step 1: Update Game Card Component
Replace static pricing with dynamic Pyth component:

```tsx
// Instead of showing static price:
<span>{game.price} GEM</span>

// Use this:
<PythGamePricing
  gameId={game.id}
  basePriceUSD={game.price * 100}
  contractAddress={CONTRACT_ADDRESS}
/>
```

### Step 2: Replace Buy Dialog
Transform the entire purchase flow to use blockchain:

```tsx
// Replace the manual GEM payment with:
<PythGamePricing
  gameId={gameId}
  basePriceUSD={price * 100}
  contractAddress={CONTRACT_ADDRESS}
  onPurchaseComplete={handlePurchaseComplete}
/>
```

### Step 3: Add Live Price Monitoring
Add real-time updates to marketplace:

```tsx
// Add this hook to marketplace pages
const useRealtimePrices = () => {
  const [ethPrice, setEthPrice] = useState(null);
  
  useEffect(() => {
    const unsubscribe = pythPriceService.subscribeToPriceUpdates(
      [pythPriceService.PRICE_FEEDS.ETH_USD],
      ([price]) => setEthPrice(price)
    );
    
    return () => unsubscribe.then(cleanup => cleanup());
  }, []);
  
  return ethPrice;
};
```

## 🔧 **Contract Configuration**

Add this to your environment variables:
```bash
# Add to .env.local
NEXT_PUBLIC_GAME_MARKETPLACE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_PYTH_ENDPOINT=https://hermes.pyth.network
NEXT_PUBLIC_NETWORK_ID=11155111  # Sepolia
```

## 💡 **Quick Start - Replace One Component**

**Immediate Impact**: Replace the game card pricing in 5 minutes:

1. Open `components/ui/game-card.tsx`
2. Find where price is displayed (around line 200-300)
3. Replace with `<PythGamePricing />` component
4. See dynamic pricing in action!

---

**Result**: Your games will now show real-time ETH prices that update every 5 seconds, with full blockchain purchase integration! 🚀