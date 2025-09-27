// app/games/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
