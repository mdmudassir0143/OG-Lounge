'use client';

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMarketplace } from '@/hooks/use-marketplace';
import { useContracts } from '@/lib/contracts-context';
import type { Game } from '@/lib/game-service';
import type { Listing } from '@/lib/contracts-context';
import { 
  ShoppingCart, 
  Eye, 
  Trash2, 
  User, 
  Calendar,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface MarketplaceNFTCardProps {
  game: Game;
  listing: Listing;
  listingId: bigint;
  onPurchaseComplete?: () => void;
  onCancelComplete?: () => void;
}

export function MarketplaceNFTCard({ 
  game, 
  listing, 
  listingId, 
  onPurchaseComplete,
  onCancelComplete 
}: MarketplaceNFTCardProps) {
  const { address } = useAccount();
  const { buyItem, cancelListing, isBuying, isCanceling } = useMarketplace();
  const { ownerOf } = useContracts();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<string>('');
  const [isLoadingOwner, setIsLoadingOwner] = useState(true);

  // Check current owner of the NFT
  useEffect(() => {
    const checkOwner = async () => {
      try {
        setIsLoadingOwner(true);
        const owner = await ownerOf(listing.tokenId);
        setCurrentOwner(owner);
      } catch (error) {
        console.error('Failed to get NFT owner:', error);
      } finally {
        setIsLoadingOwner(false);
      }
    };

    checkOwner();
  }, [listing.tokenId, ownerOf]);

  const handleBuy = async () => {
    try {
      const result = await buyItem(listingId, listing.price);
      
      if (result.success) {
        toast.success('NFT purchased successfully!', {
          description: 'The game is now yours!',
        });
        setBuyDialogOpen(false);
        onPurchaseComplete?.();
      } else {
        toast.error(result.error || 'Failed to purchase NFT');
      }
    } catch (error) {
      toast.error('Failed to purchase NFT');
    }
  };

  const handleCancel = async () => {
    try {
      const result = await cancelListing(listingId);
      
      if (result.success) {
        toast.success('Listing cancelled successfully!');
        onCancelComplete?.();
      } else {
        toast.error(result.error || 'Failed to cancel listing');
      }
    } catch (error) {
      toast.error('Failed to cancel listing');
    }
  };

  const isOwner = address && address.toLowerCase() === listing.seller.toLowerCase();
  const latestVersion = game.versions.at(-1);
  const priceInEth = formatEther(listing.price);
  const priceInUSD = (Number.parseFloat(priceInEth) * 2500).toFixed(2); // Approximate ETH to USD
  const isStillOwned = currentOwner.toLowerCase() === listing.seller.toLowerCase();

  return (
    <Card className="hover:-translate-y-0.5 overflow-hidden border-0 bg-gradient-to-br from-slate-50/50 to-white p-0 shadow-sm transition-all duration-300 hover:shadow-xl dark:from-slate-900/50 dark:to-slate-800">
      {/* Game Preview */}
      <div className="relative h-48 w-full bg-muted">
        {latestVersion?.ipfsUrl ? (
          <iframe
            src={latestVersion.ipfsUrl}
            className="h-full w-full object-cover pointer-events-none"
            title={game.title}
            style={{ transform: "scale(0.6)", transformOrigin: "top left", width: "167%", height: "167%" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <p className="text-muted-foreground text-sm">Game Preview</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* NFT Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg backdrop-blur">
            🎯 NFT #{listing.tokenId.toString()}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/80 text-white shadow-lg backdrop-blur">
            {priceInEth} ETH
          </Badge>
        </div>

        {/* Owner Badge */}
        {isOwner && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-green-500/90 text-white">
              Your Listing
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="px-4 pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="truncate">{game.title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/games/user/${game.gameId}`, '_blank')}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription className="text-sm">
          {game.description || "Premium NFT game available for purchase"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 px-4">
        {/* Price Info */}
        <div className="rounded-lg border border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50 p-3 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="text-center">
            <div className="font-bold text-green-800 text-xl dark:text-green-300">
              {priceInEth} ETH
            </div>
            <div className="text-green-600 text-xs dark:text-green-400">
              ≈ ${priceInUSD} USD
            </div>
          </div>
        </div>

        {/* Listing Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Seller:
            </span>
            <span className="font-mono">
              {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Listed:
            </span>
            <span>
              {new Date(Number(listing.listedAt) * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Warning if NFT is no longer owned by seller */}
        {!isLoadingOwner && !isStillOwned && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 dark:bg-amber-900/20 dark:border-amber-800">
            <p className="text-amber-800 text-xs dark:text-amber-200">
              ⚠️ This NFT may no longer be available
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex w-full gap-2">
          {isOwner ? (
            <Button
              onClick={handleCancel}
              disabled={isCanceling}
              variant="destructive"
              className="flex-1 gap-2"
            >
              {isCanceling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Cancel Listing
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/games/user/${game.gameId}`, '_blank')}
                className="gap-1"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              
              <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl gap-2"
                    disabled={!address || !isStillOwned}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buy Now
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Purchase NFT</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to purchase "{game.title}" for {priceInEth} ETH?
                    </DialogDescription>
                  </DialogHeader>

                  <div className="rounded-lg bg-muted p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Game:</span>
                        <span className="font-medium">{game.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token ID:</span>
                        <span className="font-medium">#{listing.tokenId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium">{priceInEth} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>USD Value:</span>
                        <span>≈ ${priceInUSD}</span>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setBuyDialogOpen(false)}
                      disabled={isBuying}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBuy}
                      disabled={isBuying}
                      className="gap-2"
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Purchasing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          Buy for {priceInEth} ETH
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}