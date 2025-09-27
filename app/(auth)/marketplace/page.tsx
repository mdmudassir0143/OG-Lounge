"use client";

import { Search, Star, Store, TrendingUp } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import MarketplaceGameCardSkeleton from "@/components/skeletons/market-skeleton";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { pythPriceService } from "@/lib/pyth-price-service";
import { PAGE_SIZE } from "@/lib/constants";
import type { Game } from "@/lib/game-service";

export default function MarketplacePage() {
  const [games, setGames] = React.useState<Game[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [ethPrice, setEthPrice] = React.useState<string>("Loading...");

  const { address: activeAddress } = useAccount();

  // Real-time ETH price monitoring
  React.useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupPriceMonitoring = async () => {
      try {
        // Get initial price
        const initialPrice = await pythPriceService.getETHPrice();
        setEthPrice(pythPriceService.formatPrice(initialPrice.price, 2));
        
        // Subscribe to real-time updates
        unsubscribe = await pythPriceService.subscribeToPriceUpdates(
          [pythPriceService.PRICE_FEEDS.ETH_USD],
          (prices) => {
            if (prices.length > 0) {
              setEthPrice(pythPriceService.formatPrice(prices[0].price, 2));
            }
          }
        );
      } catch (error) {
        console.error("Failed to setup price monitoring:", error);
        setEthPrice("Error");
      }
    };

    setupPriceMonitoring();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  React.useEffect(() => {
    const loadMarketplaceGames = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await fetch(`/api/marketplace?${params}`);
        const result = await response.json();

        if (result.success) {
          setGames(result.games);
        } else {
          toast.error("Failed to load marketplace games");
          setGames([]);
        }
      } catch {
        toast.error("Failed to load marketplace games");
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadMarketplaceGames();
  }, [page, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleBuyGame = async (gameId: string, price: number) => {
    if (!activeAddress) {
      toast.error("Please connect your wallet to purchase games");
      return;
    }

    try {
      const response = await fetch("/api/games/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
          buyerAddress: activeAddress,
          price,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Game purchased successfully!", {
          description: "You are now the owner of this game",
        });
        // Reload the games list to update ownership
        window.location.reload();
      } else {
        throw new Error(result.error || "Failed to purchase game");
      }
    } catch (error) {
      toast.error("Failed to purchase game", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
      throw error; // Re-throw to let the dialog handle it
    }
  };

  if (loading) {
    return (
      <div className="mx-auto space-y-8 p-6">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-10 w-64" />
              </div>
              <Skeleton className="h-6 w-96" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="flex items-center justify-center">
          <div className="flex w-full max-w-lg gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Games Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <MarketplaceGameCardSkeleton
              key={`marketplace-skeleton-${index}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="flex items-center gap-3 font-bold text-4xl tracking-tight">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
                <Store className="h-8 w-8 text-white" />
              </div>
              Game Marketplace
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover and play amazing games created by the community
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1 text-sm dark:bg-black/20">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{games.length} Games</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1 text-sm dark:bg-black/20">
                <Store className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Premium Quality</span>
              </div>
              <Badge className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs font-bold">ETH: ${ethPrice}</span>
              </Badge>
            </div>
          </div>
          <Link href="/editor">
            <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Star className="h-4 w-4" />
              Create Your Own Game
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-center">
        <form className="flex w-full max-w-lg gap-2" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pr-4 pl-10"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              type="text"
              value={searchQuery}
            />
          </div>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            size="icon"
            type="submit"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Games Grid */}
      {games.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 p-12 text-center dark:from-slate-900 dark:to-gray-800">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative">
            <div className="mx-auto mb-6 w-fit rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-4">
              <Store className="h-16 w-16 text-white" />
            </div>
            <h3 className="mb-3 font-bold text-2xl">No games found</h3>
            <p className="mb-8 text-lg text-muted-foreground">
              {searchQuery
                ? "Try a different search term to find amazing games"
                : "Be the first to publish a game to the marketplace and share your creativity!"}
            </p>
            <Link href="/editor">
              <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-lg hover:from-emerald-700 hover:to-teal-700">
                <Star className="h-5 w-5" />
                Create First Game
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <GameCard
              currentUserAddress={activeAddress ?? undefined}
              game={game}
              key={game.gameId}
              onBuy={handleBuyGame}
              onShare={(gameId) => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/marketplace/${gameId}`
                );
                toast.success("Game link copied!");
              }}
              variant="marketplace"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {games.length === PAGE_SIZE && (
        <div className="flex justify-center gap-2 pt-6">
          <Button
            className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 dark:border-emerald-800 dark:from-emerald-950/20 dark:to-teal-950/20"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 dark:border-emerald-800 dark:from-emerald-950/20 dark:to-teal-950/20"
            onClick={() => setPage((p) => p + 1)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
