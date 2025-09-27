"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GameState =
  | "waiting"
  | "ready"
  | "countdown"
  | "fire"
  | "result"
  | "staking"
  | "contract_ready";
type Winner = "player" | "ai" | "none";

type GameStats = {
  playerWins: number;
  aiWins: number;
};

type ContractState = {
  isConnected: boolean;
  isStaked: boolean;
  stakeAmount: bigint;
  gamePool: bigint;
  humanStake: bigint;
  botCount: bigint;
  gameStatus: bigint;
};

export default function QuickDrawGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { address: activeAddress } = useAccount();
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [winner, setWinner] = useState<Winner>("none");
  const [message, setMessage] = useState("Connect wallet to start staking!");
  const [stats, setStats] = useState<GameStats>({ playerWins: 0, aiWins: 0 });
  const [playerShot, setPlayerShot] = useState(false);
  const [aiShot, setAiShot] = useState(false);
  const [playerFell, setPlayerFell] = useState(false);
  const [aiFell, setAiFell] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showReadyIndicator, setShowReadyIndicator] = useState(false);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPostClaimDialog, setShowPostClaimDialog] = useState(false);

  const [contractState, setContractState] = useState<ContractState>({
    isConnected: false,
    isStaked: false,
    stakeAmount: BigInt(0),
    gamePool: BigInt(0),
    humanStake: BigInt(0),
    botCount: BigInt(0),
    gameStatus: BigInt(0),
  });

  const gameTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const aiReactionRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const animationRef = useRef<number | undefined>(undefined);

  // Contract constants
  const STAKE_AMOUNT = BigInt(2_000_000); // 2 $
  const BOT_COUNT = BigInt(1); // 1 AI bot (minimum required by contract)
  const REWARD = Number(BOT_COUNT * STAKE_AMOUNT + STAKE_AMOUNT) / 1_000_000; // Reward is stake * number of bots

  const endGameWithResult = (humanWon: boolean) => {
    setIsLoading(true);
    try {
      if (humanWon) {
        toast.success(`You won ${REWARD} GEM! 🎉`, {
          description:
            "Congratulations! Your winnings have been sent to your wallet.",
        });
      } else {
        toast.info("Better luck next time!", {
          description: "Your stake has been returned to the pool.",
        });
      }
    } catch {
      toast.error("Failed to process game result. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetContractGame = () => {
    setIsLoading(true);
    try {
      toast.success("Game reset! Ready for next round.");
    } catch {
      toast.error("Failed to reset game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Drawing functions
  const drawCactus = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.fillStyle = "#16a34a";
    ctx.fillRect(x, y, width, height);
    // Arms
    ctx.fillRect(x - 15, y + 20, 15, 30);
    ctx.fillRect(x + width, y + 30, 15, 25);
  };

  const drawCowboy = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: "left" | "right",
    shot: boolean,
    fell: boolean
  ) => {
    ctx.save();
    ctx.translate(x, y);
    if (facing === "right") {
      ctx.scale(-1, 1);
    }

    // Hat
    ctx.fillStyle = "#92400e";
    ctx.fillRect(-15, -40, 30, 8);
    ctx.fillRect(-20, -48, 40, 8);

    // Head
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(-10, -32, 20, 20);

    // Body
    ctx.fillStyle = "#1f2937";
    if (fell) {
      // Lying down
      ctx.fillRect(-30, -5, 40, 15);
      ctx.fillStyle = "#92400e"; // Arms
      ctx.fillRect(-35, -10, 15, 8);
      ctx.fillRect(20, -10, 15, 8);
    } else {
      // Standing
      ctx.fillRect(-12, -12, 24, 30);

      // Arms
      ctx.fillStyle = "#92400e";
      if (shot) {
        // Gun drawn
        ctx.fillRect(12, -8, 20, 6);
        ctx.fillStyle = "#374151"; // Gun
        ctx.fillRect(32, -6, 8, 3);
      } else {
        // Arms at sides
        ctx.fillRect(-18, -8, 8, 20);
        ctx.fillRect(10, -8, 8, 20);
      }

      // Legs
      ctx.fillStyle = "#1e40af";
      ctx.fillRect(-10, 18, 8, 20);
      ctx.fillRect(2, 18, 8, 20);
    }

    ctx.restore();
  };

  const drawMuzzleFlash = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) => {
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawReadyIndicator = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) => {
    // Blinking "READY" text
    const time = Date.now() * 0.005;
    const alpha = (Math.sin(time) + 1) * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("READY", x, y);
    ctx.restore();
  };

  const drawFireText = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) => {
    // Large "FIRE!" text
    ctx.save();
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 72px Arial";
    ctx.textAlign = "center";
    ctx.fillText("FIRE!", x, y);
    ctx.restore();
  };

  // Draw the game scene
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desert background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#fbbf24"); // Golden sky
    gradient.addColorStop(0.6, "#f59e0b"); // Orange horizon
    gradient.addColorStop(1, "#d97706"); // Desert ground
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Ground
    ctx.fillStyle = "#92400e";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Cacti
    drawCactus(ctx, 100, canvas.height - 150, 30, 80);
    drawCactus(ctx, canvas.width - 150, canvas.height - 130, 25, 70);

    // Player cowboy (left side)
    const playerY = playerFell ? canvas.height - 50 : canvas.height - 120;
    drawCowboy(ctx, 150, playerY, "left", playerShot, playerFell);

    // AI cowboy (right side)
    const aiY = aiFell ? canvas.height - 50 : canvas.height - 120;
    drawCowboy(ctx, canvas.width - 150, aiY, "right", aiShot, aiFell);

    // Muzzle flashes
    if (playerShot && !playerFell) {
      drawMuzzleFlash(ctx, 180, canvas.height - 100);
    }
    if (aiShot && !aiFell) {
      drawMuzzleFlash(ctx, canvas.width - 180, canvas.height - 100);
    }

    // Ready indicator (blinking "READY")
    if (showReadyIndicator && gameState === "ready") {
      drawReadyIndicator(ctx, canvas.width / 2, canvas.height / 2 - 50);
    }

    // Fire text (large "FIRE!")
    if (gameState === "fire") {
      drawFireText(ctx, canvas.width / 2, canvas.height / 2 - 50);
    }
  }, [playerShot, aiShot, playerFell, aiFell, showReadyIndicator, gameState]);

  // Game logic
  const endGame = useCallback((gameWinner: Winner, customMessage?: string) => {
    setGameState("result");
    setWinner(gameWinner);

    if (customMessage) {
      setMessage(customMessage);
    } else if (gameWinner === "player") {
      setMessage("You won the duel!");
      setAiFell(true);
      setStats((prev) => ({ ...prev, playerWins: prev.playerWins + 1 }));
    } else if (gameWinner === "ai") {
      setMessage("The AI outgunned you!");
      setPlayerFell(true);
      setStats((prev) => ({ ...prev, aiWins: prev.aiWins + 1 }));
    }

    // Show result dialog after a short delay
    setTimeout(() => {
      setShowResultDialog(true);
    }, 1000);

    // Clear timers
    if (gameTimerRef.current) {
      clearTimeout(gameTimerRef.current);
    }
    if (aiReactionRef.current) {
      clearTimeout(aiReactionRef.current);
    }
  }, []);

  const playerShoot = useCallback(() => {
    if (gameState === "fire" && !playerShot) {
      setPlayerShot(true);
      if (!aiShot) {
        endGame("player");
      }
    } else if (gameState === "ready" || gameState === "countdown") {
      // Shot too early - player loses
      setPlayerShot(true);
      endGame("ai", "You shot too early!");
    }
  }, [gameState, playerShot, aiShot, endGame]);

  const resetGame = useCallback(() => {
    setGameState("staking"); // Set to staking so user can stake again
    setMessage("Stake 2 GEM to play against 2 AI bots!");
    setWinner("none");
    setPlayerShot(false);
    setAiShot(false);
    setPlayerFell(false);
    setAiFell(false);
    setShowReadyIndicator(false);
    setShowResultDialog(false);
    setShowInstructions(false); // Don't show instructions again

    if (gameTimerRef.current) {
      clearTimeout(gameTimerRef.current);
    }
    if (aiReactionRef.current) {
      clearTimeout(aiReactionRef.current);
    }
  }, []);

  const claimReward = () => {
    if (winner === "player") {
      endGameWithResult(true);
    } else {
      // If AI won, just end the game (money stays in pool)
      endGameWithResult(false);
    }

    // Reset the contract game state so user can play again
    resetContractGame();

    // Reset the UI to allow staking again
    resetGame();
    setShowResultDialog(false);

    // Show post-claim dialog with options to stake again or go home
    setShowPostClaimDialog(true);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "KeyA") {
        e.preventDefault();
        playerShoot();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [playerShoot]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawScene();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawScene]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
      if (aiReactionRef.current) {
        clearTimeout(aiReactionRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const stakeForGame = () => {
    setIsLoading(true);
    try {
      // Simulate successful staking
      setTimeout(() => {
        setContractState((prev) => ({
          ...prev,
          isConnected: true,
          isStaked: true,
          stakeAmount: STAKE_AMOUNT,
          botCount: BOT_COUNT,
          gameStatus: BigInt(1), // Game ready
        }));
        setGameState("ready");
        setMessage("Get ready...");

        // Show "READY" indicator for 2 seconds
        setShowReadyIndicator(true);
        gameTimerRef.current = setTimeout(() => {
          setShowReadyIndicator(false);
          setGameState("countdown");
          setMessage("Wait for it...");

          // After random delay, switch to "FIRE!" state

          const delay = Math.random() * 2000 + 1000; // 1-3 seconds
          gameTimerRef.current = setTimeout(() => {
            setGameState("fire");
            setMessage("FIRE!");

            // AI reaction time
            const aiReactionTime = Math.random() * 800 + 200; // 200-1000 ms
            aiReactionRef.current = setTimeout(() => {
              if (!playerShot) {
                setAiShot(true);
                endGame("ai");
              }
            }, aiReactionTime);
          }, delay);
        }, 2000);
        setShowStakeDialog(false);
        setIsLoading(false);
      }, 1000);
    } catch {
      toast.error("Staking failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Instruction Dialog */}
      <Dialog open={showInstructions}>
        <DialogContent
          className="max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center font-mono text-2xl">
              🤠 QUICK DRAW SHOWDOWN 🤠
            </DialogTitle>
            <DialogDescription className="space-y-4 text-center">
              <span className="block font-semibold text-lg">How to Play:</span>
              <span className="block">
                • Stake 2 GEM to play against 1 AI bot
              </span>
              <span className="block">• Click START to begin the duel</span>
              <span className="block">• Wait for the "FIRE!" command</span>
              <span className="block rounded-lg bg-yellow-100 p-4 font-bold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                💰 Stake: 2 GEM | Prize: 4 GEM | Bots: 1
              </span>
              <Button
                className="w-full font-mono"
                onClick={() => {
                  setShowInstructions(false);
                  setShowStakeDialog(true);
                }}
                size="lg"
              >
                {"START DUEL"}
              </Button>
              <Link className="w-full" href="/games">
                <Button
                  className="w-full font-mono"
                  size="lg"
                  variant="outline"
                >
                  🏠 GO TO GAMES
                </Button>
              </Link>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Staking Dialog */}
      <Dialog open={showStakeDialog}>
        <DialogContent
          className="max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center font-mono text-2xl">
              💰 STAKE TO PLAY 💰
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 text-center">
                <div className="rounded-lg bg-blue-100 p-4 dark:bg-blue-900">
                  <p className="font-bold text-blue-800 dark:text-blue-200">
                    Game Details:
                  </p>
                  <p className="text-blue-600 text-sm dark:text-blue-300">
                    • Your Stake: 2 GEM
                  </p>
                  <p className="text-blue-600 text-sm dark:text-blue-300">
                    • AI Bot Stake: 2 GEM (1 bot × 2 GEM each)
                  </p>
                  <p className="text-blue-600 text-sm dark:text-blue-300">
                    • Total Prize: 4 GEM
                  </p>
                  <p className="text-blue-600 text-sm dark:text-blue-300">
                    • Winner Takes All!
                  </p>
                </div>

                {contractState.gamePool > BigInt(0) && (
                  <div className="rounded-lg bg-green-100 p-4 dark:bg-green-900">
                    <p className="font-bold text-green-800 dark:text-green-200">
                      Pool Balance: 10 $
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 font-mono hover:bg-green-700"
                    disabled={isLoading}
                    onClick={stakeForGame}
                    size="lg"
                  >
                    {isLoading ? "STAKING..." : "STAKE 2 GEM & PLAY"}
                  </Button>
                  <Link className="w-full" href="/games">
                    <Button
                      className="w-full font-mono"
                      size="lg"
                      variant="outline"
                    >
                      🏠 GO TO GAMES
                    </Button>
                  </Link>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog}>
        <DialogContent
          className="max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center font-mono text-2xl">
              {winner === "player" ? "🎉 VICTORY! 🎉" : "💀 DEFEAT 💀"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 text-center">
                <p className="font-semibold text-lg">{message}</p>

                {winner === "player" && (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-green-100 p-4 dark:bg-green-900">
                      <p className="font-bold text-green-800 dark:text-green-200">
                        You won the duel! 🏆
                      </p>
                      <p className="text-green-600 text-sm dark:text-green-300">
                        Claim your reward of 4 GEMs (2 GEM stake + 2 GEM from 1
                        AI bot)
                      </p>
                    </div>
                    <Button
                      className="w-full bg-green-600 font-mono hover:bg-green-700"
                      disabled={isLoading}
                      onClick={claimReward}
                      size="lg"
                    >
                      {isLoading ? "CLAIMING..." : "CLAIM 4 GEM 🎉"}
                    </Button>
                  </div>
                )}

                {winner === "ai" && (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-red-100 p-4 dark:bg-red-900">
                      <p className="font-bold text-red-800 dark:text-red-200">
                        The AI outgunned you! 💀
                      </p>
                      <p className="text-red-600 text-sm dark:text-red-300">
                        Better luck next time, partner!
                      </p>
                    </div>
                    <Button
                      className="w-full bg-red-600 font-mono hover:bg-red-700"
                      disabled={isLoading}
                      onClick={claimReward}
                      size="lg"
                    >
                      {isLoading ? "PROCESSING..." : "END GAME & PLAY AGAIN"}
                    </Button>
                  </div>
                )}

                <div className="flex justify-center space-x-4 text-sm">
                  <span className="text-primary">
                    Your Wins: {stats.playerWins}
                  </span>
                  <span className="text-muted-foreground">VS</span>
                  <span className="text-destructive">
                    AI Wins: {stats.aiWins}
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Post-Claim Dialog */}
      <Dialog open={showPostClaimDialog}>
        <DialogContent
          className="max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center font-mono">
              🎉 GAME COMPLETE! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              className="w-full font-mono"
              onClick={() => {
                setShowPostClaimDialog(false);
                setShowStakeDialog(true);
              }}
              size="lg"
            >
              🎮 STAKE AGAIN & PLAY
            </Button>
            <Link className="w-full" href="/games">
              <Button className="w-full font-mono" size="lg" variant="outline">
                🏠 GO TO HOME
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Game */}
      <div className="fixed inset-0 z-40 flex h-full flex-col bg-background">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b bg-background p-4">
          <h1 className="font-bold font-mono text-2xl text-foreground">
            🤠 QUICK DRAW SHOWDOWN 🤠
          </h1>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-primary">You: {stats.playerWins}</span>
              <span className="text-muted-foreground">VS</span>
              <span className="text-destructive">AI: {stats.aiWins}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center space-x-2">
              <div
                className={`h-2 w-2 rounded-full ${activeAddress ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-muted-foreground text-xs">
                {activeAddress ? "Connected" : "Disconnected"}
              </span>
            </div>
            {contractState.gamePool > BigInt(0) && (
              <>
                <div className="h-4 w-px bg-border" />
                <span className="text-muted-foreground text-xs">
                  Pool: 80 $
                </span>
              </>
            )}
          </div>
        </div>

        {/* Game Canvas - Fullscreen */}
        <div className="flex flex-1 items-center justify-center p-4">
          <canvas
            className="max-h-full max-w-full rounded-lg border border-border bg-gradient-to-b from-amber-200 to-orange-300"
            height={600}
            ref={canvasRef}
            width={1000}
          />
        </div>

        {/* Game Message - Fullscreen */}
        <div className="border-t bg-background p-6 text-center">
          <h2 className="mb-4 font-bold font-mono text-2xl text-foreground">
            {message}
          </h2>

          {(gameState === "ready" || gameState === "fire") && (
            <p className="text-muted-foreground text-sm">
              Press A to shoot when you see "FIRE!"
            </p>
          )}
        </div>
      </div>
    </>
  );
}
