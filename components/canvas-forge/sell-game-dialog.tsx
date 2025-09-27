import { DollarSign, Store, Zap } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SellGameDialogProps = {
  gameId: string;
  gameTitle: string;
  currentPrice?: number;
  isForSale?: boolean;
  isOnBlockchain?: boolean;
  blockchainGameId?: number;
  onSell: (price: number) => Promise<void>;
  onRemoveFromSale?: () => Promise<void>;
  children: React.ReactNode;
};

export function SellGameDialog({
  gameId,
  gameTitle,
  currentPrice,
  isForSale,
  isOnBlockchain,
  blockchainGameId,
  onSell,
  onRemoveFromSale,
  children,
}: SellGameDialogProps) {
  const [price, setPrice] = useState(currentPrice?.toString() || "");
  const [isSelling, setIsSelling] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isListingOnBlockchain, setIsListingOnBlockchain] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { address } = useAccount();

  const handleSell = async () => {
    const priceValue = Number.parseFloat(price);

    if (Number.isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const MIN_PRICE = 1; // Minimum $1 USD
    if (priceValue < MIN_PRICE) {
      toast.error(`Minimum price is $${MIN_PRICE} USD`);
      return;
    }

    setIsSelling(true);
    try {
      await onSell(priceValue);
      setOpen(false);
      setPrice("");
      toast.success(
        isForSale
          ? "Game price updated successfully!"
          : "Game listed for sale successfully!"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to list game for sale"
      );
    } finally {
      setIsSelling(false);
    }
  };

  const handleListOnBlockchain = async () => {
    const priceValue = Number.parseFloat(price);

    if (Number.isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price first");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet to list on blockchain");
      return;
    }

    setIsListingOnBlockchain(true);
    try {
      toast.info("Creating game on blockchain marketplace...");
      
      const response = await fetch('/api/games/list-blockchain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          priceUSD: priceValue,
          walletAddress: address
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("🎉 Game successfully listed on blockchain!", {
          description: `Your game is now available for ETH purchases. Blockchain ID: ${result.blockchainGameId}`
        });
        
        // Also list in regular marketplace if not already
        if (!isForSale) {
          await onSell(priceValue);
        }
        
        setOpen(false);
        
        // Refresh the page to show updated blockchain status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to list on blockchain");
      }
    } catch (error) {
      toast.error("Failed to list on blockchain", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsListingOnBlockchain(false);
    }
  };

  const handleRemoveFromSale = async () => {
    if (!onRemoveFromSale) {
      return;
    }

    setIsRemoving(true);
    try {
      await onRemoveFromSale();
      setOpen(false);
      toast.success("Game removed from sale successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove game from sale"
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {isForSale ? "Update Game Price" : "List Game for Sale"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="game-title">Game Title</Label>
            <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {gameTitle}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="price"
                placeholder="Enter price in USD"
                type="number"
                min="1"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-10"
                disabled={isSelling || isRemoving || isListingOnBlockchain}
              />
            </div>
          </div>

          {/* Blockchain Status */}
          {isOnBlockchain && blockchainGameId && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Listed on Blockchain
                </span>
              </div>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Blockchain ID: {blockchainGameId} • Available for ETH purchases
              </p>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isForSale
                ? "The updated price will be reflected immediately in the marketplace."
                : "Once listed, your game will be available for purchase in the marketplace. You can change the price or remove the listing at any time."}
            </p>
            
            {!isOnBlockchain && (
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                💡 List on blockchain to enable ETH purchases and decentralized ownership!
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            disabled={isSelling || isRemoving || isListingOnBlockchain}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>

          {isForSale && onRemoveFromSale && (
            <Button
              className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
              disabled={isSelling || isRemoving || isListingOnBlockchain}
              onClick={handleRemoveFromSale}
            >
              {isRemoving ? "Removing..." : "Remove from Sale"}
            </Button>
          )}

          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            disabled={isSelling || isRemoving || isListingOnBlockchain || !price}
            onClick={handleSell}
          >
            <Store className="mr-2 h-4 w-4" />
            {isSelling
              ? isForSale
                ? "Updating..."
                : "Listing..."
              : isForSale
                ? "Update Price"
                : "List for Sale"}
          </Button>

          {!isOnBlockchain && address && (
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              disabled={isSelling || isRemoving || isListingOnBlockchain || !price}
              onClick={handleListOnBlockchain}
            >
              <Zap className="mr-2 h-4 w-4" />
              {isListingOnBlockchain ? "Listing..." : "List on Blockchain"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}