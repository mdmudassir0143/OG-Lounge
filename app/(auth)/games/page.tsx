// app/games/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListNFTDialog } from "@/components/marketplace/ListNFTDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Game } from "@/lib/game-service";
import { useGameHub } from "@/hooks/use-game-hub";
import { useMarketplace } from "@/hooks/use-marketplace";

const games = [
  {
    title: "Quick Draw Showdown",
    description:
      "Stake 2 GEM and duel an AI in a lightning-fast shootout. Earn 4 GEMs if you win!",
    href: "/games/showdown",
    image: "/games/showdown.png",
    badge: "New",
    tags: ["PvP vs AI", "Staking", "Reflex"],
    stake: "2 GEM",
    reward: "4 GEM",
  },
  {
    title: "Rock Paper Scissor",
    description:
      "Test your luck and reflexes in this classic game. Play rock paper scissor with an AI. Stake 1 GEM to play against 1 AI bot!",
    href: "/games/rock-paper-scissor",
    badge: "New",
    tags: ["PvP vs AI", "Staking", "Luck"],
    stake: "1 GEM",
    reward: "2 GEM",
    image: "/games/rock-paper-scissor.png",
  },
  {
    title: "GEM Racing Championship",
    description:
      "Compete in high-speed races with customizable cars. Stake 5 GEM to enter the championship!",
    href: "/games/racing",
    image: "/games/racing.png",
    badge: "Upcoming",
    tags: ["Racing", "Strategy", "Multiplayer"],
    stake: "5 GEM",
    reward: "15 GEM",
  },
  {
    title: "Crypto Casino Royale",
    description:
      "Classic casino games with blockchain rewards. Blackjack, poker, and slots await!",
    href: "/games/casino",
    image: "/games/casino.png",
    badge: "Upcoming",
    tags: ["Casino", "Luck", "Classic"],
    stake: "1 GEM",
    reward: "10 GEM",
  },
  {
    title: "DeFi Farming Simulator",
    description:
      "Build your farming empire and stake crops for rewards. The ultimate DeFi experience!",
    href: "/games/farming",
    image: "/games/farming.png",
    badge: "Upcoming",
    tags: ["Farming", "Strategy", "DeFi"],
    stake: "3 GEM",
    reward: "8 GEM",
  },
];

const GamesPage = () => {
  const { address } = useAccount();
  const { getUserTokens } = useGameHub();
  const { isApprovedForAll } = useMarketplace();
  const [userGames, setUserGames] = React.useState<Game[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMarketplaceApproved, setIsMarketplaceApproved] = React.useState(false);

  // Fetch user's created games
  React.useEffect(() => {
    const fetchUserGames = async () => {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch games from database
        const response = await fetch(`/api/games?wallet=${address}`);
        const result = await response.json();

        if (result.success) {
          setUserGames(result.games);
        }
      } catch (error) {
        console.error("Failed to fetch user games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserGames();
  }, [address]);

  // Check marketplace approval
  React.useEffect(() => {
    const checkMarketplaceApproval = async () => {
      if (address) {
        try {
          const approved = await isApprovedForAll(address);
          setIsMarketplaceApproved(approved);
        } catch (error) {
          console.error('Failed to check marketplace approval:', error);
        }
      }
    };

    checkMarketplaceApproval();
  }, [address, isApprovedForAll]);

  return (
    <main className="mx-auto px-4 py-4">
      {/* Decorative background */}
      <div className="-z-10 pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-gradient-to-br from-violet-200/40 via-fuchsia-200/40 to-emerald-200/40 blur-3xl dark:from-violet-900/20 dark:via-fuchsia-900/20 dark:to-emerald-900/20" />
      </div>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-emerald-600 bg-clip-text font-bold text-3xl text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-emerald-400">
            Games
          </h1>
          <p className="mt-1 text-muted-foreground">
            Play on-chain mini games. More coming soon.
          </p>
        </div>
        <Badge
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow"
          variant="secondary"
        >
          +{games.filter((game) => game.badge === "Upcoming").length} Upcoming
        </Badge>
      </div>

      {/* User's Created Games Section */}
      {address && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-xl text-transparent dark:from-blue-400 dark:to-purple-400">
              Your Created Games
            </h2>
            <Link href="/editor/new">
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-600 hover:text-blue-500"
              >
                + Create Game
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={`skeleton-${i}`} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : userGames.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {userGames.map((game) => {
                const latestVersion = game.versions.at(-1);
                return (
                  <div className="group" key={game.gameId}>
                    <Card className="hover:-translate-y-0.5 overflow-hidden border-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-0 shadow-sm transition-all duration-300 hover:shadow-xl dark:from-blue-900/20 dark:to-purple-900/20">
                      <div className="relative h-40 w-full bg-muted">
                        {latestVersion?.ipfsUrl ? (
                          <iframe
                            src={latestVersion.ipfsUrl}
                            className="h-full w-full object-cover pointer-events-none"
                            title={game.title}
                            style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                            <p className="text-muted-foreground text-sm">Game Preview</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg backdrop-blur">
                            ✨ Your Game
                          </Badge>
                        </div>
                        {game.tokenId && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="outline" className="bg-white/90 text-xs">
                              NFT #{game.tokenId.toString()}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardHeader className="px-4">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>{game.title}</span>
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {game.description || "Your custom created game"}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3 px-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100 p-2 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-blue-800/20">
                            <div className="font-medium text-blue-600 text-xs dark:text-blue-400">
                              PLAYS
                            </div>
                            <div className="font-bold text-blue-800 text-sm dark:text-blue-300">
                              {game.playCount || 0}
                            </div>
                          </div>
                          <div className="rounded-lg border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100 p-2 dark:border-green-800/50 dark:from-green-900/20 dark:to-green-800/20">
                            <div className="font-medium text-green-600 text-xs dark:text-green-400">
                              VERSION
                            </div>
                            <div className="font-bold text-green-800 text-sm dark:text-green-300">
                              v{game.currentVersion}
                            </div>
                          </div>
                        </div>

                        {game.tags && game.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {game.tags.slice(0, 2).map((tag) => (
                              <Badge
                                className="border-blue-200/60 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-900/20 dark:text-blue-300"
                                key={tag}
                                variant="outline"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="p-4">
                        <div className="flex w-full gap-2">
                          <Link className="flex-1" href={`/games/user/${game.gameId}`}>
                            <Button
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                              size="sm"
                            >
                              🎮 Play Game
                            </Button>
                          </Link>
                          
                          {/* List NFT Button */}
                          {game.tokenId && (
                            <ListNFTDialog
                              tokenId={game.tokenId}
                              gameTitle={game.title}
                              isApproved={isMarketplaceApproved}
                              onApprovalNeeded={async () => {
                                if (address) {
                                  const approved = await isApprovedForAll(address);
                                  setIsMarketplaceApproved(approved);
                                }
                              }}
                              onListingComplete={() => {
                                toast.success('Your game is now listed on the marketplace!');
                              }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 border-purple-200/60 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800/60 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-800/40"
                              >
                                🏪 List
                              </Button>
                            </ListNFTDialog>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center dark:border-blue-800 dark:bg-blue-900/10">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-muted-foreground">No games created yet</h3>
              <p className="mb-4 text-muted-foreground text-sm">
                Create your first game to start earning from plays!
              </p>
              <Link href="/editor/new">
                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-600 hover:text-blue-500"
                >
                  Create Your First Game
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Featured Games Section */}
      <div className="mb-4">
        <h2 className="bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text font-bold text-xl text-transparent dark:from-violet-400 dark:to-emerald-400">
          Featured Games
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Official games with special rewards
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <div className="group" key={game.href}>
            <Card className="hover:-translate-y-0.5 overflow-hidden border-0 bg-gradient-to-br from-slate-50/50 to-white p-0 shadow-sm transition-all duration-300 hover:shadow-xl dark:from-slate-900/50 dark:to-slate-800">
              <div className="relative h-54 w-full bg-muted">
                <Image
                  alt={game.title}
                  className="object-cover object-bottom"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={game.image}
                />
                {/* overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {game.badge && (
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`shadow-lg backdrop-blur ${
                        game.badge === "New"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      }`}
                      variant="default"
                    >
                      {game.badge === "New" ? "✨" : "🚀"} {game.badge}
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="px-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{game.title}</span>
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500" />
                </CardTitle>
                <CardDescription className="text-sm">
                  {game.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 px-4">
                {/* Staking & Reward Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-amber-200/50 bg-gradient-to-br from-amber-50 to-yellow-50 p-2 dark:border-amber-800/50 dark:from-amber-900/20 dark:to-yellow-900/20">
                    <div className="font-medium text-amber-600 text-xs dark:text-amber-400">
                      STAKE
                    </div>
                    <div className="font-bold text-amber-800 text-sm dark:text-amber-300">
                      {game.stake}
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-green-50 p-2 dark:border-emerald-800/50 dark:from-emerald-900/20 dark:to-green-900/20">
                    <div className="font-medium text-emerald-600 text-xs dark:text-emerald-400">
                      REWARD
                    </div>
                    <div className="font-bold text-emerald-800 text-sm dark:text-emerald-300">
                      {game.reward}
                    </div>
                  </div>
                </div>

                {game.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((t) => (
                      <Badge
                        className="border-violet-200/60 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-900/20 dark:text-violet-300"
                        key={t}
                        variant="outline"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>

              <CardFooter className="p-4">
                {game.badge === "Upcoming" ? (
                  <Button
                    className="w-full cursor-not-allowed bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
                    disabled
                    size="sm"
                  >
                    🚀 Coming Soon
                  </Button>
                ) : (
                  <Link className="w-full" href={game.href}>
                    <Button
                      className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 text-white shadow-lg transition-all hover:from-violet-700 hover:to-emerald-700 hover:shadow-xl"
                      size="sm"
                    >
                      🎮 Play & Earn
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </main>
  );
};

export default GamesPage;
