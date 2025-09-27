"use client";

import { ArrowLeft, Store } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import QrShare from "@/components/ui/qr-share";
import {
  WALLET_ADDRESS_PREFIX_LENGTH,
  WALLET_ADDRESS_SUFFIX_LENGTH,
} from "@/lib/constants";
import type { Game } from "@/lib/game-service";
export default function MarketplaceGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const mountedRef = React.useRef(true);
  const [game, setGame] = React.useState<Game | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/marketplace");
      const result = await response.json();

      if (result.success) {
        const foundGame = result.games.find((g: Game) => g.gameId === gameId);
        if (foundGame) {
          if (mountedRef.current) {
            setGame(foundGame);
          }
        } else {
          toast.error("Game not found");
          router.push("/marketplace");
        }
      }
    } catch {
      toast.error("Failed to load game");
      router.push("/marketplace");
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [gameId, router]);

  React.useEffect(() => {
    load();

    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  // Hide the global navbar/header while on the full-screen marketplace game page
  React.useEffect(() => {
    const header =
      typeof document !== "undefined"
        ? (document.querySelector("header") as HTMLElement | null)
        : null;
    if (header) {
      const prevDisplay = header.style.display;
      header.style.display = "none";
      return () => {
        header.style.display = prevDisplay || "";
      };
    }
    // return () => {};
  }, []);

  // const handleShare = () => {
  //   if (navigator.share && game) {
  //     navigator.share({
  //       title: game.title,
  //       text: `Check out this awesome game: ${game.title}`,
  //       url: window.location.href,
  //     });
  //   } else {
  //     navigator.clipboard.writeText(window.location.href);
  //     toast.success("Game link copied to clipboard!");
  //   }
  // };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, WALLET_ADDRESS_PREFIX_LENGTH)}...${address.slice(
      -WALLET_ADDRESS_SUFFIX_LENGTH
    )}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
            <p className="text-muted-foreground">Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <Store className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-xl">Game not found</h3>
          <p className="mb-6 text-muted-foreground">
            The game you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/marketplace">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const latestVersion = game.versions.at(-1);
  const gameUrl = latestVersion?.ipfsUrl;

  return (
    <div className="h-screen min-h-screen w-screen bg-black">
      <div className="relative h-screen w-full">
        {/* Full-viewport game iframe */}
        {(() => {
          if (gameUrl) {
            return (
              <iframe
                className="h-full w-full border-0"
                src={gameUrl}
                title={game.title}
              />
            );
          }

          if (latestVersion?.html) {
            return (
              <iframe
                className="h-full w-full border-0"
                srcDoc={latestVersion.html}
                title={game.title}
              />
            );
          }

          return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <p className="text-gray-500">Game not available</p>
            </div>
          );
        })()}

        {/* Top-left overlay: back button + title */}
        <div className="absolute top-12 left-4 z-50 flex items-center gap-3">
          <Link href="/marketplace">
            <Button className="gap-2" size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-semibold text-lg text-white">{game.title}</h1>
        </div>

        {/* Top-right overlay: avatar (popover) + share button */}
        <div className="absolute top-12 right-4 z-50 flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="p-0" variant="ghost">
                <Avatar>
                  {game.walletAddress ? (
                    <AvatarFallback className="text-xs">
                      {formatWalletAddress(game.walletAddress)}
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback />
                  )}
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="text-sm">
                <div className="font-medium">Creator</div>
                <div className="mt-1 font-mono">
                  {formatWalletAddress(game.walletAddress)}
                </div>
                <div className="mt-2 text-muted-foreground">
                  Published:{" "}
                  {formatDate(game.marketplacePublishedAt || game.createdAt)}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <QrShare url={window.location.href} />
          </div>
        </div>
      </div>
    </div>
  );
}
