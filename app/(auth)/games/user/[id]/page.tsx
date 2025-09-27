"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Game } from "@/lib/game-service";
import { useGameHub } from "@/hooks/use-game-hub";
import { 
  Play, 
  ShoppingCart, 
  ArrowLeft, 
  Gamepad2, 
  Coins, 
  Trophy,
  Heart,
  Clock,
  Loader2
} from "lucide-react";

export default function UserGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { address } = useAccount();

  const [game, setGame] = React.useState<Game | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [freeChances, setFreeChances] = React.useState<bigint>(BigInt(0));
  const [boughtChances, setBoughtChances] = React.useState<bigint>(BigInt(0));
  const [buyDialogOpen, setBuyDialogOpen] = React.useState(false);
  const [chancesToBuy, setChancesToBuy] = React.useState(1);

  const {
    playGame,
    getRemainingFreeChances,
    getBoughtChances,
    buyChance,
    isPlaying,
    isBuyingChance,
  } = useGameHub();

  // Load game data
  React.useEffect(() => {
    const loadGame = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/games?gameId=${gameId}`);
        const result = await response.json();

        if (result.success && result.games.length > 0) {
          setGame(result.games[0]);
        } else {
          toast.error("Game not found");
          router.push("/games");
        }
      } catch (error) {
        console.error("Failed to load game:", error);
        toast.error("Failed to load game");
        router.push("/games");
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [gameId, router]);

  // Load chances data when game and user are available
  React.useEffect(() => {
    const loadChances = async () => {
      if (!game?.tokenId || !address) return;

      try {
        const [free, bought] = await Promise.all([
          getRemainingFreeChances(address, game.tokenId),
          getBoughtChances(address, game.tokenId),
        ]);

        setFreeChances(free);
        setBoughtChances(bought);
      } catch (error) {
        console.error("Failed to load chances:", error);
      }
    };

    loadChances();
  }, [game?.tokenId, address, getRemainingFreeChances, getBoughtChances]);

  const handlePlay = async () => {
    if (!game?.tokenId) {
      toast.error("Game not available");
      return;
    }

    const totalChances = freeChances + boughtChances;
    if (totalChances === BigInt(0)) {
      toast.error("No chances remaining. Buy more chances to continue playing!");
      setBuyDialogOpen(true);
      return;
    }

    try {
      const result = await playGame(game.tokenId);
      
      if (result.success) {
        toast.success("Game played successfully!");
        // Refresh chances
        if (address) {
          const [free, bought] = await Promise.all([
            getRemainingFreeChances(address, game.tokenId),
            getBoughtChances(address, game.tokenId),
          ]);
          setFreeChances(free);
          setBoughtChances(bought);
        }
      } else {
        toast.error(result.error || "Failed to play game");
      }
    } catch (error) {
      toast.error("Failed to play game");
    }
  };

  const handleBuyChances = async () => {
    if (!game?.tokenId || chancesToBuy <= 0) return;

    try {
      const result = await buyChance(chancesToBuy, game.tokenId);
      
      if (result.success) {
        toast.success(`Successfully bought ${chancesToBuy} chance${chancesToBuy > 1 ? 's' : ''}!`);
        setBuyDialogOpen(false);
        setChancesToBuy(1);
        
        // Refresh bought chances
        if (address) {
          const bought = await getBoughtChances(address, game.tokenId);
          setBoughtChances(bought);
        }
      } else {
        toast.error(result.error || "Failed to buy chances");
      }
    } catch (error) {
      toast.error("Failed to buy chances");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-12 w-2/3" />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <Button onClick={() => router.push("/games")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  const latestVersion = game.versions.at(-1);
  const totalChances = freeChances + boughtChances;
  const pricePerChance = 0.0001; // 0.0001 ETH per chance
  const totalCost = pricePerChance * chancesToBuy;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/games")}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text font-bold text-4xl text-transparent">
              {game.title}
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              {game.description || "Play this custom created game"}
            </p>
            <div className="mt-4 flex items-center gap-4">
              {game.tokenId && (
                <Badge variant="outline" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  NFT #{game.tokenId.toString()}
                </Badge>
              )}
              <Badge variant="outline" className="gap-1">
                <Gamepad2 className="h-3 w-3" />
                v{game.currentVersion}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {game.playCount || 0} plays
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Game Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Game Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                {latestVersion?.ipfsUrl ? (
                  <iframe
                    src={latestVersion.ipfsUrl}
                    className="h-full w-full"
                    title={game.title}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Game preview not available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Controls */}
        <div className="space-y-6">
          {/* Chances Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Chances Remaining
              </CardTitle>
              <CardDescription>
                Play up to 5 times for free, then buy additional chances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
                  <div className="text-green-600 text-sm font-medium dark:text-green-400">
                    Free Chances
                  </div>
                  <div className="text-green-800 text-2xl font-bold dark:text-green-300">
                    {freeChances.toString()}
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
                  <div className="text-blue-600 text-sm font-medium dark:text-blue-400">
                    Bought Chances
                  </div>
                  <div className="text-blue-800 text-2xl font-bold dark:text-blue-300">
                    {boughtChances.toString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handlePlay}
                  disabled={isPlaying || totalChances === BigInt(0) || !address}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isPlaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Play Game ({totalChances.toString()} left)
                    </>
                  )}
                </Button>

                <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!address}
                      className="gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Buy Chances
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-amber-500" />
                        Buy More Chances
                      </DialogTitle>
                      <DialogDescription>
                        Purchase additional chances to continue playing. Each chance costs 0.0001 ETH.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="chances">Number of chances</Label>
                        <Input
                          id="chances"
                          type="number"
                          min="1"
                          max="100"
                          value={chancesToBuy}
                          onChange={(e) => setChancesToBuy(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        />
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <div className="flex justify-between text-sm">
                          <span>Cost per chance:</span>
                          <span className="font-medium">0.0001 ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Quantity:</span>
                          <span className="font-medium">{chancesToBuy}</span>
                        </div>
                        <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{totalCost.toFixed(2)} ETH</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Creator gets 70% • Protocol gets 30%
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setBuyDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBuyChances}
                        disabled={isBuyingChance || chancesToBuy <= 0}
                        className="gap-2"
                      >
                        {isBuyingChance ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Buying...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            Buy for {totalCost.toFixed(2)} ETH
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {totalChances === BigInt(0) && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
                  <p className="text-amber-800 text-sm dark:text-amber-200">
                    <strong>No chances remaining!</strong> Purchase more chances to continue playing and earn rewards.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card>
            <CardHeader>
              <CardTitle>Game Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creator:</span>
                <span className="font-mono text-sm">
                  {game.walletAddress.slice(0, 6)}...{game.walletAddress.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(game.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date(game.updatedAt).toLocaleDateString()}</span>
              </div>
              {game.tags && game.tags.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {game.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {!address && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <CardContent className="pt-6">
                <p className="text-amber-800 dark:text-amber-200">
                  <strong>Connect your wallet</strong> to play this game and track your chances.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}