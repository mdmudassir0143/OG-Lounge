'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Zap } from 'lucide-react';
import { pythPriceService, type PriceData, type GamePriceCalculation } from '@/lib/pyth-price-service';
import { toast } from 'sonner';

interface PythGamePricingProps {
  gameId: string;
  basePriceUSD: number; // Price in cents
  contractAddress: `0x${string}`;
  onPurchaseComplete?: () => void;
}

const GAME_ECONOMY_ABI = [
  {
    name: 'getCurrentGamePrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'gameId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'purchaseGame',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'priceUpdateData', type: 'bytes[]' },
    ],
    outputs: [],
  },
  {
    name: 'updateGamePrice',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'gameId', type: 'uint256' },
      { name: 'priceUpdateData', type: 'bytes[]' },
    ],
    outputs: [],
  },
] as const;

export function PythGamePricing({ 
  gameId, 
  basePriceUSD, 
  contractAddress, 
  onPurchaseComplete
}: PythGamePricingProps) {
  const [ethPrice, setEthPrice] = useState<PriceData | null>(null);
  const [gamePrice, setGamePrice] = useState<GamePriceCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [priceUpdateData, setPriceUpdateData] = useState<string[]>([]);

  // Convert string gameId to numeric ID for contract
  const getNumericGameId = (gameId: string): bigint => {
    // Extract timestamp from gameId (e.g., "game_1757526497571_fcctf08" -> "1757526497571")
    const match = gameId.match(/game_(\d+)_/);
    if (match && match[1]) {
      return BigInt(match[1]);
    }
    
    // Fallback: Create a hash-based numeric ID
    let hash = 0;
    for (let i = 0; i < gameId.length; i++) {
      const char = gameId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return BigInt(Math.abs(hash));
  };

  const numericGameId = getNumericGameId(gameId);

  // Contract hooks
  const { data: currentContractPrice } = useReadContract({
    address: contractAddress,
    abi: GAME_ECONOMY_ABI,
    functionName: 'getCurrentGamePrice',
    args: [numericGameId],
  });

  const { 
    writeContract: purchaseGame, 
    data: purchaseHash,
    isPending: isPurchasePending
  } = useWriteContract();

  const { 
    writeContract: updatePrice, 
    data: updateHash,
    isPending: isUpdatePending
  } = useWriteContract();

  const { isLoading: isPurchaseConfirming } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  });

  const { isLoading: isUpdateConfirming } = useWaitForTransactionReceipt({
    hash: updateHash,
  });

  // Fetch ETH price and calculate game pricing
  const fetchPriceData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current ETH price from Pyth
      const currentEthPrice = await pythPriceService.getETHPrice();
      setEthPrice(currentEthPrice);
      
      // Calculate game price in Wei
      const priceInWei = await pythPriceService.calculateGamePriceInWei(basePriceUSD);
      
      // Get price update data for smart contract
      const updateData = await pythPriceService.getPriceUpdateData([
        pythPriceService.PRICE_FEEDS.ETH_USD
      ]);
      setPriceUpdateData(updateData);
      
      const ethPriceNumber = Number(currentEthPrice.price.price) * Math.pow(10, currentEthPrice.price.expo);
      
      const gamePriceCalc: GamePriceCalculation = {
        usdPriceCents: basePriceUSD,
        ethPriceUsd: ethPriceNumber,
        priceInWei,
        priceInEth: Number(formatEther(BigInt(priceInWei))),
        lastUpdated: Date.now(),
      };
      
      setGamePrice(gamePriceCalc);
      
      // Update price history for trend visualization
      setPriceHistory(prev => [...prev.slice(-9), ethPriceNumber]);
      
    } catch (error) {
      console.error('Error fetching price data:', error);
      toast.error('Failed to fetch current prices');
    } finally {
      setIsLoading(false);
    }
  }, [basePriceUSD]);

  // Subscribe to real-time price updates
  useEffect(() => {
    fetchPriceData();
    
    // Set up price subscription
    const unsubscribe = pythPriceService.subscribeToPriceUpdates(
      [pythPriceService.PRICE_FEEDS.ETH_USD],
      (prices) => {
        if (prices.length > 0) {
          setEthPrice(prices[0]);
          const ethPriceNumber = Number(prices[0].price.price) * Math.pow(10, prices[0].price.expo);
          setPriceHistory(prev => [...prev.slice(-9), ethPriceNumber]);
        }
      }
    );

    return () => {
      unsubscribe.then(cleanup => cleanup());
    };
  }, [fetchPriceData]);

  // Handle game purchase
  const handlePurchase = async () => {
    if (!gamePrice || !priceUpdateData.length) {
      toast.error('Price data not ready');
      return;
    }

    try {
      setIsPurchasing(true);
      
      // Get fresh price update data
      const freshUpdateData = await pythPriceService.getPriceUpdateData([
        pythPriceService.PRICE_FEEDS.ETH_USD
      ]);
      
      // Calculate total value needed (game price + update fee buffer)
      const gameValueWei = BigInt(gamePrice.priceInWei);
      const bufferWei = parseEther('0.001'); // Small buffer for update fees
      const totalValue = gameValueWei + bufferWei;
      
      await purchaseGame({
        address: contractAddress,
        abi: GAME_ECONOMY_ABI,
        functionName: 'purchaseGame',
        args: [numericGameId, freshUpdateData as `0x${string}`[]],
        value: totalValue,
      });
      
      toast.success('Purchase transaction submitted!');
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Handle price update
  const handlePriceUpdate = async () => {
    if (!priceUpdateData.length) {
      toast.error('Price update data not ready');
      return;
    }

    try {
      setIsUpdatingPrice(true);
      
      const freshUpdateData = await pythPriceService.getPriceUpdateData([
        pythPriceService.PRICE_FEEDS.ETH_USD
      ]);
      
      const updateFeeBuffer = parseEther('0.0005');
      
      await updatePrice({
        address: contractAddress,
        abi: GAME_ECONOMY_ABI,
        functionName: 'updateGamePrice',
        args: [numericGameId, freshUpdateData as `0x${string}`[]],
        value: updateFeeBuffer,
      });
      
      toast.success('Price update submitted!');
    } catch (error) {
      console.error('Price update error:', error);
      toast.error('Price update failed');
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Calculate price trend
  const getPriceTrend = () => {
    if (priceHistory.length < 2) return null;
    const current = priceHistory[priceHistory.length - 1];
    const previous = priceHistory[priceHistory.length - 2];
    return current > previous ? 'up' : current < previous ? 'down' : 'stable';
  };

  const trend = getPriceTrend();
  const confidence = ethPrice ? pythPriceService.getPriceConfidence(ethPrice.price) : 0;
  const isStale = ethPrice ? pythPriceService.isPriceStale(ethPrice.publishTime) : false;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading price data...</span>
        </CardContent>
      </Card>
    );
  }

  // Full layout for standalone use
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Dynamic Game Pricing
        </CardTitle>
        <CardDescription>
          Real-time pricing powered by Pyth Network
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* ETH Price Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                ETH/USD Price
              </span>
              <div className="flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                <Badge variant={isStale ? 'destructive' : 'default'} className="text-xs">
                  {isStale ? 'Stale' : 'Live'}
                </Badge>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">
                ${ethPrice ? pythPriceService.formatPrice(ethPrice.price, 2) : 'N/A'}
              </span>
              {confidence > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  ±{confidence.toFixed(2)}% confidence
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Game Price
              </span>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {gamePrice ? gamePrice.priceInEth.toFixed(6) : 'N/A'} ETH
              </div>
              <div className="text-sm text-gray-500">
                ${(basePriceUSD / 100).toFixed(2)} USD
              </div>
            </div>
          </div>
        </div>

        {/* Contract vs Calculated Price Comparison */}
        {currentContractPrice && gamePrice && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Price Comparison
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-300">Contract Price:</span>
                <div className="font-mono">
                  {Number(formatEther(currentContractPrice)).toFixed(6)} ETH
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-300">Calculated Price:</span>
                <div className="font-mono">
                  {gamePrice.priceInEth.toFixed(6)} ETH
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handlePurchase}
            disabled={isPurchasing || isPurchasePending || isPurchaseConfirming || !gamePrice}
            className="flex-1"
          >
            {(isPurchasing || isPurchasePending || isPurchaseConfirming) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Purchase Game
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePriceUpdate}
            disabled={isUpdatingPrice || isUpdatePending || isUpdateConfirming}
            className="flex-1 sm:flex-none"
          >
            {(isUpdatingPrice || isUpdatePending || isUpdateConfirming) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update Price
          </Button>
        </div>

        {/* Price Update Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Prices update automatically every 5 seconds</p>
          <p>• Purchase includes Pyth Network update fees</p>
          <p>• Game price adjusts in real-time with ETH market movements</p>
        </div>
      </CardContent>
    </Card>
  );
}