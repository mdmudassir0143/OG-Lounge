"use client";

import {
  Calendar,
  Code,
  Eye,
  GitFork,
  Search,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MAX_TAGS_DISPLAY,
  PAGE_SIZE,
  WALLET_ADDRESS_PREFIX_LENGTH,
  WALLET_ADDRESS_SUFFIX_LENGTH,
} from "@/lib/constants";
import type { Game } from "@/lib/game-service";

export default function CommunityPage() {
  const [games, setGames] = React.useState<Game[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const loadCommunityGames = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/community?${params}`);
      const result = await response.json();

      if (result.success) {
        setGames(result.games);
      } else {
        toast.error("Failed to load community games");
      }
    } catch {
      toast.error("Failed to load community games");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  React.useEffect(() => {
    loadCommunityGames();
  }, [loadCommunityGames]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatWalletAddress = (address: string) => {
    // If the address is shorter than the combined prefix/suffix, return it as-is
    if (
      address.length <=
      WALLET_ADDRESS_PREFIX_LENGTH + WALLET_ADDRESS_SUFFIX_LENGTH
    ) {
      return address;
    }
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
            <p className="text-muted-foreground">Loading community games...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
            <Users className="h-8 w-8 text-blue-600" />
            Game Community
          </h1>
          <p className="text-muted-foreground">
            Explore, fork, and improve games created by developers worldwide
          </p>
        </div>
        <Link href="/editor">
          <Button className="gap-2">Share Your Creation</Button>
        </Link>
      </div>

      {/* Search */}
      <form className="flex max-w-md gap-2" onSubmit={handleSearch}>
        <Input
          className="flex-1"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search community games..."
          type="text"
          value={searchQuery}
        />
        <Button size="icon" type="submit">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Games Grid */}
      {games.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 font-semibold text-xl">
            No community games found
          </h3>
          <p className="mb-6 text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "Be the first to share a game with the community!"}
          </p>
          <Link href="/editor">
            <Button className="gap-2">Share First Game</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <Card
              className="group transition-shadow hover:shadow-lg"
              key={game.gameId}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="line-clamp-1 transition-colors group-hover:text-primary">
                      {game.title}
                      {game.originalGameId && (
                        <Badge className="ml-2 text-xs" variant="outline">
                          <GitFork className="mr-1 h-3 w-3" />
                          Fork
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {game.description || "No description provided"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tags */}
                {game.tags && game.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {game.tags.slice(0, MAX_TAGS_DISPLAY).map((tag) => (
                      <Badge className="text-xs" key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {game.tags.length > MAX_TAGS_DISPLAY && (
                      <Badge className="text-xs" variant="secondary">
                        +{game.tags.length - MAX_TAGS_DISPLAY}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {formatWalletAddress(game.walletAddress)}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {game.forkCount} forks
                  </div>
                  <div className="flex items-center gap-1">
                    <Code className="h-3 w-3" />v{game.currentVersion}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(game.communityPublishedAt || game.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link className="flex-1" href={`/community/${game.gameId}`}>
                    <Button
                      className="w-full gap-2"
                      size="sm"
                      variant="default"
                    >
                      <Eye className="h-3 w-3" />
                      View & Fork
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {games.length === PAGE_SIZE && (
        <div className="flex justify-center gap-2 pt-6">
          <Button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            variant="outline"
          >
            Previous
          </Button>
          <Button onClick={() => setPage((p) => p + 1)} variant="outline">
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
