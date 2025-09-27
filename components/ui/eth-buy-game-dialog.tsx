import { CreditCard, DollarSign, Store, Zap } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
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
import { pythPriceService } from "@/lib/pyth-price-service";
import { BlockchainService } from "@/lib/blockchain-service";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { ethers } from "ethers";

type EthBuyGameDialogProps = {
  gameId: string;
  gameTitle: string;
  usdPrice: number;
  blockchainGameId?: number; // The numeric blockchain ID
  isNFT?: boolean;
  onBuy: (usdPrice: number, ethAmount: string, transactionHash: string) => Promise<void>;
  children: React.ReactNode;
};

export function EthBuyGameDialog({
  gameId,
  gameTitle,
  usdPrice,
  blockchainGameId,
  isNFT = false,
  onBuy,
  children,
}: EthBuyGameDialogProps) {
  const [isBuying, setIsBuying] = useState(false);
  const [open, setOpen] = useState(false);
  const [ethAmount, setEthAmount] = useState<string>("");
  const [ethPrice, setEthPrice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Calculate ETH equivalent when dialog opens
  useEffect(() => {
    if (open) {
      calculateEthPrice();
      // Set up price refresh interval
      const interval = setInterval(calculateEthPrice, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [open, usdPrice]);

  const calculateEthPrice = async () => {
    try {
      setLoading(true);
      const ethPriceWei = await pythPriceService.calculateGamePriceInWei(usdPrice * 100);
      const ethFormatted = ethers.formatEther(ethPriceWei);
      setEthAmount(ethFormatted);
      
      // Also get current ETH/USD rate for display
      const currentEthPrice = await pythPriceService.getETHPrice();
      const ethPriceNumber = Number(currentEthPrice.price.price) * Math.pow(10, currentEthPrice.price.expo);
      setEthPrice(ethPriceNumber.toFixed(2));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error calculating ETH price:", error);
      toast.error("Failed to get current ETH price");
    } finally {
      setLoading(false);
    }
  };

  const { address } = useAccount();

  const handleBuy = async () => {
    if (!ethAmount) {
      toast.error("ETH amount not calculated");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsBuying(true);
    try {
      // Check if wallet is connected and get provider
      if (typeof (window as any).ethereum === 'undefined') {
        throw new Error("MetaMask or compatible wallet not found");
      }

      const ethereum = (window as any).ethereum;

      // Request account access
      await ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      // Create blockchain service instance
      const blockchainService = new BlockchainService();
      await blockchainService.connectWallet(ethereum);

      // Get current price in ETH and add 5% buffer for price fluctuation
      const ethPriceWei = await pythPriceService.calculateGamePriceInWei(usdPrice * 100);
      const priceWithBuffer = (BigInt(ethPriceWei) * BigInt(105)) / BigInt(100);

      // Create contract interface for transaction
      const contractABI = [
        "function purchaseGame(uint256 gameId, bytes[] calldata priceUpdateData) external payable"
      ];
      const contractAddress = CONTRACT_ADDRESSES.sepolia.GameMarketplace;
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Check if we have a blockchain game ID
      if (!blockchainGameId) {
        toast.error("Blockchain Purchase Not Available", {
          description: "This game hasn't been listed on the blockchain marketplace yet. You can still purchase it through the regular marketplace."
        });
        
        // For now, call the regular onBuy function to handle database-only purchase
        await onBuy(usdPrice, ethAmount, "0x0"); // Use placeholder transaction hash
        toast.success("Game purchased successfully!");
        setOpen(false);
        return;
      }

      toast.info("Sending transaction to blockchain...");

      // Send the purchase transaction using the numeric blockchain game ID
      const tx = await contract.purchaseGame(
        blockchainGameId, // Use the numeric blockchain ID
        [], // Empty price update data for now
        {
          value: priceWithBuffer,
          gasLimit: 300000, // Set reasonable gas limit
        }
      );

      toast.info("Waiting for transaction confirmation...");

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        // Transaction successful, now call the API to update our database
        await onBuy(usdPrice, ethAmount, receipt.hash);
        setOpen(false);
        toast.success("🎉 Game purchased successfully on blockchain!", {
          description: `Transaction: ${receipt.hash.slice(0, 10)}...`
        });
      } else {
        throw new Error("Transaction failed on blockchain");
      }

    } catch (error: any) {
      console.error("Purchase error:", error);
      
      // Handle different types of errors
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient ETH balance for purchase");
      } else if (error.message?.includes("user rejected")) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error(
          error.message || "Failed to purchase game on blockchain"
        );
      }
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
            {isNFT ? "Purchase NFT Game with ETH" : "Purchase Game with ETH"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-emerald-800 text-sm dark:text-emerald-200">
                {gameTitle}
              </span>
              {isNFT && (
                <div className="ml-2 rounded-full bg-blue-500 px-2 py-1 text-xs text-white">
                  NFT
                </div>
              )}
            </div>
            
            {/* USD Price */}
            <div className="mt-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-emerald-800 text-lg dark:text-emerald-200">
                ${usdPrice} USD
              </span>
            </div>

            {/* ETH Price */}
            <div className="mt-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              {loading ? (
                <span className="text-blue-700 text-sm dark:text-blue-300">
                  Calculating ETH price...
                </span>
              ) : (
                <div className="flex flex-col">
                  <span className="font-bold text-blue-800 text-lg dark:text-blue-200">
                    {parseFloat(ethAmount).toFixed(6)} ETH
                  </span>
                  <span className="text-blue-600 text-xs dark:text-blue-400">
                    ETH @ ${ethPrice} USD
                  </span>
                </div>
              )}
            </div>

            {lastUpdated && (
              <div className="mt-2 text-emerald-600 text-xs dark:text-emerald-400">
                Price updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-slate-600 text-sm dark:text-slate-400">
              {isNFT 
                ? "By purchasing this NFT game with ETH, you will own a unique digital asset and can:"
                : "By purchasing this game with ETH, you will become the new owner and can:"
              }
            </p>
            <ul className="space-y-1 text-slate-600 text-sm dark:text-slate-400">
              <li>• Play the game anytime</li>
              <li>• {isNFT ? "Access encrypted game code" : "Modify and improve the game"}</li>
              <li>• {isNFT ? "Trade as a digital collectible" : "Sell the game to others"}</li>
              <li>• {isNFT ? "Prove ownership on blockchain" : "Earn rewards from game plays"}</li>
            </ul>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
            <p className="text-blue-800 text-xs dark:text-blue-200">
              <strong>⚡ Powered by Pyth Network:</strong> Real-time ETH/USD price feeds ensure you get the most accurate conversion rates. Price updates every 10 seconds.
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
            <p className="text-amber-800 text-xs dark:text-amber-200">
              <strong>Note:</strong> Payment will be processed in ETH on the Ethereum blockchain. Make sure you have sufficient ETH balance plus gas fees.
            </p>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            disabled={isBuying || loading}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            disabled={isBuying || loading || !ethAmount}
            onClick={handleBuy}
          >
            <Zap className="mr-2 h-4 w-4" />
            {isBuying ? "Processing..." : `Buy with ${parseFloat(ethAmount || "0").toFixed(4)} ETH`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}