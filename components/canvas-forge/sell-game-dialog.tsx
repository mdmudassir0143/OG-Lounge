import { DollarSign, Store } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
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
import { MIN_SELL_PRICE } from "@/lib/constants";

type SellGameDialogProps = {
  gameId: string;
  gameTitle: string;
  currentPrice?: number;
  isForSale?: boolean;
  onSell: (price: number) => Promise<void>;
  onRemoveFromSale?: () => Promise<void>;
  children: React.ReactNode;
};

export function SellGameDialog({
  gameTitle,
  currentPrice,
  isForSale,
  onSell,
  onRemoveFromSale,
  children,
}: SellGameDialogProps) {
  const [price, setPrice] = useState(currentPrice?.toString() || "");
  const [isSelling, setIsSelling] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSell = async () => {
    const priceValue = Number.parseFloat(price);

    if (Number.isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const MIN_PRICE = 0.1;
    if (priceValue < MIN_PRICE) {
      toast.error(`Minimum price is ${MIN_PRICE} GEM`);
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
            <Store className="h-5 w-5 text-emerald-500" />
            {isForSale ? "Update Game Price" : "Sell Your Game"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-emerald-800 text-sm dark:text-emerald-200">
                Game: {gameTitle}
              </span>
            </div>
            <p className="mt-2 text-emerald-700 text-sm dark:text-emerald-300">
              {isForSale
                ? "Update the price for your game. The new price will be reflected immediately in the marketplace."
                : "Set a price for your game. Once sold, you'll receive the payment and the buyer will own the game."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (GEM)</Label>
            <Input
              id="price"
              min={MIN_SELL_PRICE}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in GEM"
              step="0.1"
              type="number"
              value={price}
            />
            <p className="text-slate-600 text-xs dark:text-slate-400">
              Minimum price: {MIN_SELL_PRICE} GEM
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-slate-600 text-xs dark:text-slate-400">
              <strong>Note:</strong>{" "}
              {isForSale
                ? "The updated price will be reflected immediately in the marketplace."
                : "Once listed, your game will be available for purchase in the marketplace. You can change the price or remove the listing at any time."}
            </p>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            disabled={isSelling || isRemoving}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>

          {isForSale && onRemoveFromSale && (
            <Button
              className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
              disabled={isSelling || isRemoving}
              onClick={handleRemoveFromSale}
            >
              {isRemoving ? "Removing..." : "Remove from Sale"}
            </Button>
          )}

          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            disabled={isSelling || isRemoving || !price}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
