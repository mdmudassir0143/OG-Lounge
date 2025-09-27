import { CreditCard, DollarSign, Store } from "lucide-react";
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

type BuyGameDialogProps = {
  gameTitle: string;
  price: number;
  onBuy: () => Promise<void>;
  children: React.ReactNode;
};

export function BuyGameDialog({
  gameTitle,
  price,
  onBuy,
  children,
}: BuyGameDialogProps) {
  const [isBuying, setIsBuying] = useState(false);
  const [open, setOpen] = useState(false);

  const handleBuy = async () => {
    setIsBuying(true);
    try {
      await onBuy();
      setOpen(false);
      toast.success("Game purchased successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to purchase game"
      );
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Purchase Game
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-emerald-800 text-sm dark:text-emerald-200">
                {gameTitle}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-emerald-800 text-lg dark:text-emerald-200">
                {price} GEM
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-600 text-sm dark:text-slate-400">
              By purchasing this game, you will become the new owner and can:
            </p>
            <ul className="space-y-1 text-slate-600 text-sm dark:text-slate-400">
              <li>• Play the game anytime</li>
              <li>• Modify and improve the game</li>
              <li>• Sell the game to others</li>
              <li>• Earn rewards from game plays</li>
            </ul>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
            <p className="text-amber-800 text-xs dark:text-amber-200">
              <strong>Note:</strong> This purchase will transfer ownership of
              the game to you. The transaction will be processed on the GEMrand
              blockchain.
            </p>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            disabled={isBuying}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            disabled={isBuying}
            onClick={handleBuy}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isBuying ? "Processing..." : `Buy for ${price} GEM`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
