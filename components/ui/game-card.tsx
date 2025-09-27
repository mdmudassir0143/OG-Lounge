import {
  Calendar,
  Code,
  CreditCard,
  Edit,
  Play,
  ShoppingCart,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { MagicCard } from "@/components/magicui/magic-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuyGameDialog } from "@/components/ui/buy-game-dialog";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import QrShare from "@/components/ui/qr-share";
import { PythPricingDialog } from "@/components/pyth/PythPricingDialog";
import { POPULAR_FORK_THRESHOLD } from "@/lib/constants";
import { GAME_MARKETPLACE_ADDRESS } from "@/lib/contracts";
import type { Game } from "@/lib/game-service";

type GameCardProps = {
  game: Game;
  variant?: "editor" | "marketplace";
  onDelete?: (gameId: string) => void;
  onShare?: (gameId: string) => void;
  onBuy?: (gameId: string, price: number) => Promise<void>;
  currentUserAddress?: string;
};

/* Helper utilities extracted to reduce complexity of the main component */
const WALLET_ADDRESS_PREFIX_LENGTH = 6;
const WALLET_ADDRESS_SUFFIX_LENGTH = 4;
const MAX_TAGS_DISPLAY = 3;

const formatDate = (dateString: string | Date) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatWalletAddress = (address?: string) => {
  if (
    !address ||
    address.length <=
      WALLET_ADDRESS_PREFIX_LENGTH + WALLET_ADDRESS_SUFFIX_LENGTH
  ) {
    return address ?? "";
  }
  return `${address.slice(0, WALLET_ADDRESS_PREFIX_LENGTH)}...${address.slice(
    -WALLET_ADDRESS_SUFFIX_LENGTH
  )}`;
};

const getInitial = (text?: string) =>
  text ? text.trim().charAt(0).toUpperCase() : "G";

const bannerGradient = (variant: GameCardProps["variant"]) =>
  variant === "marketplace"
    ? "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600"
    : "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700";

const glowColorFromVariant = (variant: GameCardProps["variant"]) =>
  variant === "marketplace" ? "emerald" : "violet";

/* Small presentational subcomponents to keep GameCard simple */
function TagsSection({
  game,
  variant,
}: {
  game: Game;
  variant: GameCardProps["variant"];
}) {
  if (!game.tags || game.tags.length === 0) {
    return null;
  }
  return (
    <div className="bg-gradient-to-r from-slate-50/50 to-transparent px-6 py-4 dark:from-slate-800/50">
      <div className="flex flex-wrap gap-2">
        {game.tags.slice(0, MAX_TAGS_DISPLAY).map((tag) => (
          <Badge
            className={`rounded-full px-3 py-1.5 font-medium text-xs transition-all duration-200 hover:scale-105 ${
              variant === "marketplace"
                ? "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "border-violet-200 bg-violet-100 text-violet-700 hover:bg-violet-200 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
            }`}
            key={tag}
            variant="outline"
          >
            {tag}
          </Badge>
        ))}
        {game.tags.length > MAX_TAGS_DISPLAY && (
          <Badge
            className="rounded-full border-slate-200 bg-slate-100 px-3 py-1.5 font-medium text-slate-600 text-xs transition-all duration-200 hover:scale-105 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
            variant="outline"
          >
            +{game.tags.length - MAX_TAGS_DISPLAY} more
          </Badge>
        )}
      </div>
    </div>
  );
}

function StatsSection({
  variant,
  game,
}: {
  variant: GameCardProps["variant"];
  game: Game;
}) {
  const glowColor = glowColorFromVariant(variant);
  if (variant === "editor") {
    return (
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Updated
            </span>
            <div className="flex items-center gap-2 rounded-lg bg-slate-100/50 p-2 transition-colors hover:bg-slate-200/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50">
              <Calendar className={`h-4 w-4 text-${glowColor}-500`} />
              <span className="font-medium text-sm">
                {formatDate(game.updatedAt)}
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Plays
            </span>
            <div className="flex items-center gap-2 rounded-lg bg-slate-100/50 p-2 transition-colors hover:bg-slate-200/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50">
              <Play className={`h-4 w-4 text-${glowColor}-500`} />
              <span className="font-medium text-sm">{game.playCount || 0}</span>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Forks
            </span>
            <div className="flex items-center gap-2 rounded-lg bg-slate-100/50 p-2 transition-colors hover:bg-slate-200/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50">
              <Users className={`h-4 w-4 text-${glowColor}-500`} />
              <span className="font-medium text-sm">{game.forkCount}</span>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-right font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Version
            </span>
            <div className="flex items-center justify-end gap-2 rounded-lg bg-slate-100/50 p-2 transition-colors hover:bg-slate-200/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50">
              <Code className={`h-4 w-4 text-${glowColor}-500`} />
              <span className="font-medium text-sm">
                v{game.currentVersion}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-slate-100/50 p-2 dark:bg-slate-800/50">
          <User className="h-4 w-4 text-emerald-500" />
          <span className="font-medium text-sm">
            {formatWalletAddress(game.walletAddress)}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-100/50 p-2 dark:bg-slate-800/50">
          <Play className="h-4 w-4 text-emerald-500" />
          <span className="font-medium text-sm">
            {game.playCount || 0} plays
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-100/50 p-2 dark:bg-slate-800/50">
          <Calendar className="h-4 w-4 text-emerald-500" />
          <span className="font-medium text-sm">
            {formatDate(game.marketplacePublishedAt || game.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActionsSection({
  variant,
  game,
  onDelete,
  onShare,
  onBuy,
  currentUserAddress,
}: {
  variant: GameCardProps["variant"];
  game: Game;
  onDelete?: (gameId: string) => void;
  onShare?: (gameId: string) => void;
  onBuy?: (gameId: string, price: number) => Promise<void>;
  currentUserAddress?: string;
}) {
  if (variant === "editor") {
    return (
      <>
        <Link className="flex-1" href={`/editor/${game.gameId}`}>
          <Button
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl"
            size="sm"
            type="button"
            variant="default"
          >
            <Edit className="h-4 w-4" />
            Edit Game
          </Button>
        </Link>
        {game.isPublishedToMarketplace && (
          <Link href={`/marketplace/${game.gameId}`}>
            <Button
              className="border-violet-200 transition-all duration-200 hover:scale-105 hover:border-violet-300 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-900/20"
              size="sm"
              type="button"
              variant="outline"
            >
              <Play className="h-4 w-4" />
            </Button>
          </Link>
        )}
        {onDelete && (
          <Button
            className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
            onClick={() => onDelete(game.gameId)}
            size="sm"
            type="button"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </>
    );
  }

  // If game is for sale and user can buy, show buy dialog
  if (game.isForSale && game.salePrice && onBuy && currentUserAddress) {
    return (
      <>
        <Link className="flex-1" href={`/marketplace/${game.gameId}`}>
          <Button
            className="w-full gap-2 border-emerald-200 text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
            size="sm"
            type="button"
            variant="outline"
          >
            <Play className="h-4 w-4" />
            Play Game
          </Button>
        </Link>

        {/* Pyth Pricing Dialog */}
        <div className="flex-1">
          <PythPricingDialog
            gameId={game.gameId}
            basePriceUSD={(game.salePrice ?? 1) * 100} // Convert GEM to USD cents
            contractAddress={GAME_MARKETPLACE_ADDRESS}
            onPurchaseComplete={() => onBuy?.(game.gameId, game.salePrice ?? 0)}
            gameTitle={game.title}
          />
        </div>

        {onShare && (
          <QrShare
            url={`${typeof window !== "undefined" ? window.location.origin : ""}/marketplace/${game.gameId}`}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Link className="flex-1" href={`/marketplace/${game.gameId}`}>
        <Button
          className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl"
          size="sm"
          type="button"
          variant="default"
        >
          <Play className="h-4 w-4" />
          Play Game
        </Button>
      </Link>

      {onShare && (
        <div className="flex items-center">
          <QrShare
            url={`${typeof window !== "undefined" ? window.location.origin : ""}/marketplace/${game.gameId}`}
          />
        </div>
      )}
    </>
  );
}

/* Main component simplified and delegating responsibilities */
export function GameCard({
  game,
  variant = "editor",
  onDelete,
  onShare,
  onBuy,
  currentUserAddress,
}: GameCardProps) {
  // const glowColor = glowColorFromVariant(variant);

  return (
    <div className="group relative">
      {/* Ambient glow effect */}
      <div
        className={`-inset-0.5 absolute bg-gradient-to-br ${
          variant === "marketplace"
            ? "from-emerald-400 to-cyan-600"
            : "from-violet-500 to-indigo-600"
        } rounded-2xl opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-20`}
      />

      <MagicCard
        className="relative transform-gpu overflow-hidden rounded-xl border-0 p-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        gradientColor={variant === "marketplace" ? "#10b981" : "#8b5cf6"}
        gradientOpacity={0.1}
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50/50 to-white p-0 shadow-lg backdrop-blur-sm dark:from-slate-900/50 dark:to-slate-800">
          {/* Enhanced Banner with animated background */}
          <div className="relative overflow-hidden">
            <div
              className={`relative h-32 ${bannerGradient(variant)} flex items-center`}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,theme(colors.white/10)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,theme(colors.white/10)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[conic-gradient(from_230deg_at_51%_48%,theme(colors.white/0)_0deg,theme(colors.white/5)_67.5deg,theme(colors.white/0)_198deg)]" />
              </div>

              {/* Content overlay */}
              <div className="relative w-full px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/20 shadow-xl backdrop-blur-sm">
                        <span className="font-bold text-white text-xl drop-shadow-lg">
                          {getInitial(game.title)}
                        </span>
                      </div>
                      {/* Floating indicator for popular games */}
                      {game.forkCount > POPULAR_FORK_THRESHOLD && (
                        <div className="-top-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white shadow-lg">
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate font-bold text-white text-xl leading-tight drop-shadow-md">
                        {game.title}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 text-sm text-white/90 leading-relaxed">
                        {game.description || "No description provided"}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {game.isPublishedToMarketplace && (
                        <Badge
                          className="border-white/30 bg-white/20 text-white text-xs backdrop-blur-sm transition-colors hover:bg-white/30"
                          variant="outline"
                        >
                          <ShoppingCart className="mr-1 h-3 w-3" />
                          Marketplace
                        </Badge>
                      )}
                      {game.isPublishedToCommunity && (
                        <Badge
                          className="border-white/30 bg-white/20 text-white text-xs backdrop-blur-sm transition-colors hover:bg-white/30"
                          variant="outline"
                        >
                          <Users className="mr-1 h-3 w-3" />
                          Community
                        </Badge>
                      )}
                    </div>
                    {game.originalGameId && (
                      <Badge
                        className="border-amber-400/50 bg-amber-500/80 text-white text-xs backdrop-blur-sm"
                        variant="outline"
                      >
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Fork
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TagsSection game={game} variant={variant} />

          <StatsSection game={game} variant={variant} />

          {/* Enhanced Actions Section */}
          <div className="border-slate-200/50 border-t bg-gradient-to-r from-slate-50/30 to-transparent dark:border-slate-700/50 dark:from-slate-800/30">
            <div className="flex gap-3 px-6 py-4">
              <ActionsSection
                currentUserAddress={currentUserAddress}
                game={game}
                onBuy={onBuy}
                onDelete={onDelete}
                onShare={onShare}
                variant={variant}
              />
            </div>
          </div>
        </Card>
      </MagicCard>
    </div>
  );
}
