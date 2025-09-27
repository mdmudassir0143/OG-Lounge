'use client';

import { useState } from 'react';
import { formatEther, parseEther } from 'viem';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMarketplace } from '@/hooks/use-marketplace';
import { Store, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface ListNFTDialogProps {
  tokenId: bigint;
  gameTitle: string;
  children?: React.ReactNode;
  isApproved?: boolean;
  onApprovalNeeded?: () => void;
  onListingComplete?: () => void;
}

export function ListNFTDialog({ 
  tokenId, 
  gameTitle, 
  children, 
  isApproved = false,
  onApprovalNeeded,
  onListingComplete 
}: ListNFTDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [step, setStep] = useState<'approval' | 'listing'>('listing');
  const { 
    listItem, 
    approveMarketplace, 
    setApprovalForAll, 
    isListing, 
    isApproving 
  } = useMarketplace();

  const handleApprove = async () => {
    try {
      setStep('approval');
      const result = await setApprovalForAll(true);
      
      if (result.success) {
        toast.success('Marketplace approved successfully!');
        setStep('listing');
        onApprovalNeeded?.();
      } else {
        toast.error(result.error || 'Failed to approve marketplace');
      }
    } catch (error) {
      toast.error('Failed to approve marketplace');
    }
  };

  const handleList = async () => {
    if (!price || Number.parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const priceInWei = parseEther(price);
      const result = await listItem(tokenId, priceInWei);
      
      if (result.success) {
        toast.success('Game NFT listed successfully!');
        setIsOpen(false);
        setPrice('');
        onListingComplete?.();
      } else {
        toast.error(result.error || 'Failed to list NFT');
      }
    } catch (error) {
      toast.error('Failed to list NFT');
    }
  };

  const priceInUSD = price ? (Number.parseFloat(price) * 2500).toFixed(2) : '0.00'; // Approximate ETH to USD

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Store className="h-4 w-4" />
            List for Sale
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
              <Store className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            List Game NFT
          </DialogTitle>
          <DialogDescription>
            List your game NFT "{gameTitle}" for sale on the marketplace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* NFT Info */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{gameTitle}</p>
                <p className="text-sm text-muted-foreground">
                  Token ID: #{tokenId.toString()}
                </p>
              </div>
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Owned
              </Badge>
            </div>
          </div>

          {/* Approval Status */}
          {!isApproved && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0 dark:text-amber-400" />
                <div className="flex-1">
                  <p className="text-amber-800 text-sm font-medium dark:text-amber-200">
                    Approval Required
                  </p>
                  <p className="text-amber-700 text-sm dark:text-amber-300">
                    You need to approve the marketplace to manage your NFTs before listing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">Listing Price (ETH)</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              min="0.001"
              placeholder="0.1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={!isApproved}
            />
            {price && (
              <p className="text-muted-foreground text-xs">
                ≈ ${priceInUSD} USD (estimated)
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          {price && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium text-sm">Price Breakdown</p>
              <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Listing Price:</span>
                  <span>{price} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>You receive:</span>
                  <span className="font-medium">{price} ETH</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isListing || isApproving}
          >
            Cancel
          </Button>
          
          {!isApproved ? (
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="gap-2"
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Approve Marketplace
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleList}
              disabled={isListing || !price || Number.parseFloat(price) <= 0}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isListing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Listing...
                </>
              ) : (
                <>
                  <Store className="h-4 w-4" />
                  List for {price} ETH
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}