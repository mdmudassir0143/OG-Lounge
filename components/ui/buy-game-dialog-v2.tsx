import { CreditCard, DollarSign, Store, Shield, Lock, Key } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEncryptedGameNFTService } from '@/lib/encrypted-game-nft-service-v2';

type BuyGameDialogProps = {
  gameTitle: string;
  price: number;
  onBuy: () => Promise<void>;
  children: React.ReactNode;
  // New props for encrypted NFT support
  isEncryptedNFT?: boolean;
  tokenId?: string;
  priceInETH?: string;
  creatorAddress?: string;
  royaltyPercentage?: number;
};

export function BuyGameDialog({
  gameTitle,
  price,
  onBuy,
  children,
  isEncryptedNFT = false,
  tokenId,
  priceInETH,
  creatorAddress,
  royaltyPercentage,
}: BuyGameDialogProps) {
  const [isBuying, setIsBuying] = useState(false);
  const [open, setOpen] = useState(false);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleBuy = async () => {
    setIsBuying(true);
    try {
      if (isEncryptedNFT && tokenId && walletClient) {
        // Handle encrypted NFT purchase
        await handleEncryptedNFTPurchase();
      } else {
        // Handle regular game purchase
        await onBuy();
      }
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

  const handleEncryptedNFTPurchase = async () => {
    if (!walletClient || !address || !tokenId) {
      throw new Error('Wallet not connected or invalid token ID');
    }

    try {
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftService = createEncryptedGameNFTService(provider, signer);

      const txHash = await nftService.purchaseEncryptedGame({
        tokenId,
        buyerAddress: address
      });

      toast.success('🎉 Encrypted Game NFT Purchased!', {
        description: `Transaction: ${txHash.slice(0, 10)}...`
      });
    } catch (error: any) {
      console.error('Encrypted NFT purchase failed:', error);
      throw new Error(`Failed to purchase encrypted NFT: ${error.message}`);
    }
  };

  const formatPrice = (priceValue: number) => {
    if (isEncryptedNFT) {
      return `$${(priceValue / 100).toFixed(2)} USD`;
    }
    return `$${priceValue.toFixed(2)}`;
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEncryptedNFT ? (
              <>
                <Shield className="h-5 w-5 text-purple-600" />
                Purchase Encrypted Game NFT
              </>
            ) : (
              <>
                <Store className="h-5 w-5" />
                Purchase Game
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-lg">{gameTitle}</h3>
            
            {isEncryptedNFT && (
              <div className="mt-2 space-y-2">
                <Badge className="gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  <Lock className="h-3 w-3" />
                  Encrypted NFT
                </Badge>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Token ID: {tokenId}</div>
                  <div>Creator: {creatorAddress?.slice(0, 6)}...{creatorAddress?.slice(-4)}</div>
                  {royaltyPercentage && (
                    <div>Creator Royalty: {(royaltyPercentage / 100).toFixed(1)}%</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-muted-foreground">Price:</span>
              <div className="text-right">
                <div className="font-bold text-xl">{formatPrice(price)}</div>
                {isEncryptedNFT && priceInETH && (
                  <div className="text-sm text-muted-foreground">
                    ≈ {parseFloat(priceInETH).toFixed(6)} ETH
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEncryptedNFT && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Encrypted Game:</strong> Upon purchase, you'll receive secure access to the game code. 
                The content is encrypted and only accessible to the NFT owner.
              </AlertDescription>
            </Alert>
          )}

          {!address && (
            <Alert>
              <AlertDescription>
                Please connect your wallet to purchase this {isEncryptedNFT ? 'encrypted game NFT' : 'game'}.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBuy} 
            disabled={isBuying || !address}
            className={isEncryptedNFT ? 
              "gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700" :
              "gap-2"
            }
          >
            <CreditCard className="h-4 w-4" />
            {isBuying ? "Processing..." : `Buy for ${formatPrice(price)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}