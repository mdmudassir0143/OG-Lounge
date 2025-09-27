'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ShoppingCart, Zap, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import { PythGamePricing } from './PythGamePricing';

interface PythPricingDialogProps {
  gameId: string;
  basePriceUSD: number; // Price in cents
  contractAddress: `0x${string}`;
  onPurchaseComplete?: () => void;
  gameTitle?: string;
  children?: React.ReactNode;
}

export function PythPricingDialog({ 
  gameId, 
  basePriceUSD, 
  contractAddress, 
  onPurchaseComplete,
  gameTitle = "Game",
  children
}: PythPricingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePurchaseComplete = () => {
    onPurchaseComplete?.();
    setIsOpen(false); // Close dialog after purchase
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all duration-200 hover:from-emerald-700 hover:to-teal-700"
            size="sm"
          >
            <CreditCard className="h-4 w-4" />
            Buy Game
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              Purchase {gameTitle}
            </div>
          </DialogTitle>
          <DialogDescription>
            Real-time pricing powered by Pyth Network. Prices update every 5 seconds using live ETH market data.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <PythGamePricing
            gameId={gameId}
            basePriceUSD={basePriceUSD}
            contractAddress={contractAddress}
            onPurchaseComplete={handlePurchaseComplete}
          />
        </div>

        {/* Additional purchase info */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2 text-sm">
              <div className="font-medium text-blue-800 dark:text-blue-200">
                Dynamic Pricing Information
              </div>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Prices update every 5 seconds using live ETH market data</li>
                <li>• Purchase includes Pyth Network oracle update fees</li>
                <li>• Transaction is secured by smart contract on Ethereum</li>
                <li>• Game ownership is permanently recorded on blockchain</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}