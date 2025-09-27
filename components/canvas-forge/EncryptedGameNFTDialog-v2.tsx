"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { 
  Shield, 
  Lock, 
  DollarSign,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { createEncryptedGameNFTService, type MintGameNFTParams, type MintResult } from '@/lib/encrypted-game-nft-service-v2';
import { BrowserProvider } from 'ethers';

interface EncryptedGameNFTDialogProps {
  gameCode?: string;
  gameTitle?: string;
  children?: React.ReactNode;
  onSuccess?: (tokenId: string, gameId?: string) => void;
}

export function EncryptedGameNFTDialog({ 
  gameCode = '', 
  gameTitle = '', 
  children,
  onSuccess 
}: EncryptedGameNFTDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [title, setTitle] = useState(gameTitle || 'Untitled Game');
  const [description, setDescription] = useState('');
  const [gameCodeInput, setGameCodeInput] = useState(gameCode || '');
  const [priceUSD, setPriceUSD] = useState(500); // $5.00 in cents
  const [royaltyPercentage, setRoyaltyPercentage] = useState(500); // 5% in basis points

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handleMintNFT = async () => {
    if (!address) {
      toast.error('Please connect wallet');
      return;
    }

    if (!walletClient) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create ethers provider and signer from wallet client
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      
      const nftService = createEncryptedGameNFTService(provider, signer);

      const codeToUse = gameCode || gameCodeInput;
      
      if (!codeToUse.trim()) {
        toast.error('Please provide game code');
        return;
      }

      const mintParams: MintGameNFTParams = {
        title,
        description: description || `Encrypted game created on ${new Date().toLocaleDateString()}`,
        priceUSD,
        gameCode: codeToUse,
        royaltyPercentage
      };

      const mintResult = await nftService.mintEncryptedGame(mintParams);
      
      // Save to MongoDB using existing save route
      try {
        const saveResponse = await fetch('/api/games/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html: codeToUse,
            title,
            description: description || `Encrypted game created on ${new Date().toLocaleDateString()}`,
            walletAddress: address,
            // Add NFT-specific fields for the existing save route
            isNFT: true,
            nftData: {
              tokenId: mintResult.tokenId,
              contractAddress: '0xC08F8713412CD1097DbaFb284dFB856E634712C6',
              transactionHash: mintResult.transactionHash,
              encryptedMetadataURI: mintResult.encryptedMetadataURI,
              metadataHash: mintResult.metadataHash,
              ipfsHash: mintResult.ipfsHash,
              priceUSD,
              royaltyPercentage,
              networkName: 'sepolia',
              mintedAt: new Date().toISOString()
            }
          }),
        });

        const saveResult = await saveResponse.json();
        
        if (saveResult.success) {
          toast.success('🎉 Encrypted Game NFT Created & Saved!', {
            description: `Token ID: ${mintResult.tokenId}. Game saved with ID: ${saveResult.game?.gameId || 'unknown'}. IPFS: ${mintResult.ipfsHash}`
          });

          if (onSuccess) {
            onSuccess(mintResult.tokenId, saveResult.game?.gameId);
          }
        } else {
          toast.error('NFT created but failed to save game data');
        }
      } catch (saveError) {
        console.error('Error saving game:', saveError);
        toast.error('NFT created but failed to save game data');
      }

      setOpen(false);
    } catch (error: any) {
      console.error('Minting error:', error);
      toast.error('Failed to create encrypted NFT', {
        description: error.message || 'Please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            className="gap-2 border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 dark:border-purple-800 dark:from-purple-950/20 dark:to-violet-950/20"
          >
            <Shield className="h-4 w-4" />
            Create Encrypted NFT
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-4 w-4 text-purple-600" />
            Create Encrypted NFT
          </DialogTitle>
          <DialogDescription className="text-sm">
            Mint your game as a secure NFT with encrypted code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Compact Info */}
          <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-violet-950/20">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>ERC-7857 NFT:</strong> Secure encrypted storage, automatic royalties, Pyth pricing
            </AlertDescription>
          </Alert>

          {/* Contract Address Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Contract:</strong> 0xC08F8713412CD1097DbaFb284dFB856E634712C6 (Sepolia)
              <br />
              <strong>Standard:</strong> ERC-721 + ERC-7857 (0G Network iNFT)
            </AlertDescription>
          </Alert>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nft-title">Game Title</Label>
              <Input
                id="nft-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter game title"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nft-description">Description</Label>
              <Textarea
                id="nft-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your encrypted game NFT"
                rows={2}
                maxLength={500}
              />
            </div>

            {/* Show game code input if not provided as prop */}
            {!gameCode && (
              <div className="space-y-2">
                <Label htmlFor="game-code">Game Code</Label>
                <Textarea
                  id="game-code"
                  value={gameCodeInput}
                  onChange={(e) => setGameCodeInput(e.target.value)}
                  placeholder="Paste your HTML/CSS/JS game code here..."
                  rows={4}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {gameCodeInput.length} characters
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price-usd">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="price-usd"
                    type="number"
                    value={priceUSD / 100} // Convert cents to dollars for display
                    onChange={(e) => setPriceUSD(Math.round(parseFloat(e.target.value) * 100))}
                    placeholder="5.00"
                    min="0.01"
                    step="0.01"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Current price: ${(priceUSD / 100).toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="royalty">Royalty (%)</Label>
                <Input
                  id="royalty"
                  type="number"
                  value={royaltyPercentage / 100} // Convert basis points to percentage for display
                  onChange={(e) => setRoyaltyPercentage(Math.round(parseFloat(e.target.value) * 100))}
                  placeholder="5"
                  min="0"
                  max="10"
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground">
                  Royalty on secondary sales: {(royaltyPercentage / 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Game Code Preview */}
          {(gameCode || gameCodeInput) && (
            <div className="space-y-2">
              <Label>Game Code Preview</Label>
              <div className="rounded-md border bg-muted/50 p-3">
                <code className="text-xs">
                  {(gameCode || gameCodeInput).substring(0, 200)}
                  {(gameCode || gameCodeInput).length > 200 && '...'}
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Code size: {(gameCode || gameCodeInput).length} characters
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleMintNFT}
              disabled={isLoading || !address || !title.trim()}
              className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isLoading ? 'Creating NFT...' : 'Create Encrypted NFT'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>

          {!address && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please connect your wallet to create an encrypted game NFT.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}