"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  onGround: boolean;
  color: string;
  isAI: boolean;
};

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

type GameState = {
  player1Score: number;
  player2Score: number;
  timeLeft: number;
  gameRunning: boolean;
  gameOver: boolean;
  winner: string | null;
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const BALL_BOUNCE = 0.8;
const GOAL_WIDTH = 80;
const GOAL_HEIGHT = 120;
const GAME_DURATION = 60;

export default function HeadSoccerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const keysRef = useRef<Set<string>>(new Set());

  const [gameState, setGameState] = useState<GameState>({
    player1Score: 0,
    player2Score: 0,
    timeLeft: GAME_DURATION,
    gameRunning: false,
    gameOver: false,
    winner: null,
  });

  const playerRef = useRef<Player>({
    x: 150,
    y: CANVAS_HEIGHT - 100,
    vx: 0,
    vy: 0,
    width: 40,
    height: 60,
    onGround: false,
    color: "#15803d",
    isAI: false,
  });

  const aiPlayerRef = useRef<Player>({
    x: CANVAS_WIDTH - 190,
    y: CANVAS_HEIGHT - 100,
    vx: 0,
    vy: 0,
    width: 40,
    height: 60,
    onGround: false,
    color: "#ea580c",
    isAI: true,
  });

  const ballRef = useRef<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: 15,
  });

  const gameTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const resetGame = useCallback(() => {
    playerRef.current = {
      x: 150,
      y: CANVAS_HEIGHT - 100,
      vx: 0,
      vy: 0,
      width: 40,
      height: 60,
      onGround: false,
      color: "#15803d",
      isAI: false,
    };

    aiPlayerRef.current = {
      x: CANVAS_WIDTH - 190,
      y: CANVAS_HEIGHT - 100,
      vx: 0,
      vy: 0,
      width: 40,
      height: 60,
      onGround: false,
      color: "#ea580c",
      isAI: true,
    };

    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2 - 100,
      vx: 0,
      vy: -3,
      radius: 15,
    };

    setGameState({
      player1Score: 0,
      player2Score: 0,
      timeLeft: GAME_DURATION,
      gameRunning: true,
      gameOver: false,
      winner: null,
    });
  }, []);

  const startGame = useCallback(() => {
    resetGame();

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        const newTimeLeft = prev.timeLeft - 1;
        if (newTimeLeft <= 0) {
          const winner =
            prev.player1Score > prev.player2Score
              ? "Player 1"
              : prev.player2Score > prev.player1Score
                ? "AI Player"
                : "Tie";
          return {
            ...prev,
            timeLeft: 0,
            gameRunning: false,
            gameOver: true,
            winner,
          };
        }
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);
  }, [resetGame]);

  const stopGame = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // AI Logic
  const updateAI = useCallback(() => {
    const ai = aiPlayerRef.current;
    const ball = ballRef.current;

    // Simple AI: move towards ball and jump when close
    const distanceToBall = Math.abs(ai.x - ball.x);

    if (ball.x < ai.x - 20) {
      ai.vx = -MOVE_SPEED * 0.8; // AI moves slightly slower
    } else if (ball.x > ai.x + 20) {
      ai.vx = MOVE_SPEED * 0.8;
    } else {
      ai.vx *= 0.8; // Slow down when near ball
    }

    // Jump if ball is above and close
    if (distanceToBall < 60 && ball.y < ai.y && ai.onGround) {
      ai.vy = JUMP_FORCE;
      ai.onGround = false;
    }
  }, []);

  // Physics update
  const updatePhysics = useCallback(() => {
    const player = playerRef.current;
    const aiPlayer = aiPlayerRef.current;
    const ball = ballRef.current;

    // Handle player input
    if (keysRef.current.has("a")) player.vx = -MOVE_SPEED;
    else if (keysRef.current.has("d")) player.vx = MOVE_SPEED;
    else player.vx *= 0.8;

    if (keysRef.current.has("w") && player.onGround) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
    }

    // Update AI
    updateAI();

    // Apply gravity and update positions
    const players = [player, aiPlayer];
    players.forEach((p) => {
      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;

      // Ground collision
      if (p.y + p.height >= CANVAS_HEIGHT - 20) {
        p.y = CANVAS_HEIGHT - 20 - p.height;
        p.vy = 0;
        p.onGround = true;
      }

      // Wall collision
      if (p.x < 0) p.x = 0;
      if (p.x + p.width > CANVAS_WIDTH) p.x = CANVAS_WIDTH - p.width;
    });

    // Ball physics
    ball.vy += GRAVITY * 0.3;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball ground collision
    if (ball.y + ball.radius >= CANVAS_HEIGHT - 20) {
      ball.y = CANVAS_HEIGHT - 20 - ball.radius;
      ball.vy *= -BALL_BOUNCE;
      ball.vx *= 0.95;
    }

    // Ball wall collision
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= CANVAS_WIDTH) {
      ball.vx *= -BALL_BOUNCE;
      ball.x =
        ball.x - ball.radius <= 0 ? ball.radius : CANVAS_WIDTH - ball.radius;
    }

    // Ball ceiling collision
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy *= -BALL_BOUNCE;
    }

    // Ball goal post collision - prevent ball from going over goal posts
    const goalTop = CANVAS_HEIGHT - GOAL_HEIGHT - 20;

    // Left goal post collision - ball hitting the top surface from above
    if (
      ball.x - ball.radius <= GOAL_WIDTH &&
      ball.y - ball.radius <= goalTop &&
      ball.y + ball.radius >= goalTop &&
      ball.vy < 0
    ) {
      ball.y = goalTop + ball.radius;
      ball.vy *= -BALL_BOUNCE;
    }

    // Right goal post collision - ball hitting the top surface from above
    if (
      ball.x + ball.radius >= CANVAS_WIDTH - GOAL_WIDTH &&
      ball.y - ball.radius <= goalTop &&
      ball.y + ball.radius >= goalTop &&
      ball.vy < 0
    ) {
      ball.y = goalTop + ball.radius;
      ball.vy *= -BALL_BOUNCE;
    }

    // Player-ball collision
    players.forEach((p, index) => {
      const dx = ball.x - (p.x + p.width / 2);
      const dy = ball.y - (p.y + p.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball.radius + 25) {
        const angle = Math.atan2(dy, dx);
        const force = 8;
        ball.vx = Math.cos(angle) * force;
        ball.vy = Math.sin(angle) * force;

        // Super shot detection
        const isSuperShot =
          (index === 0 && keysRef.current.has("w")) ||
          (index === 1 && Math.random() < 0.1); // AI has 10% chance for super shot
        if (isSuperShot) {
          ball.vx *= 1.5;
          ball.vy *= 1.5;
        }
      }
    });

    // Goal detection
    if (
      ball.x - ball.radius <= 0 &&
      ball.y >= CANVAS_HEIGHT - GOAL_HEIGHT - 20
    ) {
      setGameState((prev) => ({
        ...prev,
        player2Score: prev.player2Score + 1,
      }));
      ball.x = CANVAS_WIDTH / 2;
      ball.y = CANVAS_HEIGHT / 2 - 100;
      ball.vx = 0;
      ball.vy = -3;
    }

    if (
      ball.x + ball.radius >= CANVAS_WIDTH &&
      ball.y >= CANVAS_HEIGHT - GOAL_HEIGHT - 20
    ) {
      setGameState((prev) => ({
        ...prev,
        player1Score: prev.player1Score + 1,
      }));
      ball.x = CANVAS_WIDTH / 2;
      ball.y = CANVAS_HEIGHT / 2 - 100;
      ball.vx = 0;
      ball.vy = -3;
    }
  }, [updateAI]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with a solid background color
    ctx.fillStyle = "#22c55e"; // Green background for the entire field
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw the entire ground with a solid color
    ctx.fillStyle = "#22c55e"; // Green color for the ground
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Center line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
    ctx.stroke();

    // Goals
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    // Left goal
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 20);
    ctx.lineTo(0, CANVAS_HEIGHT - GOAL_HEIGHT - 20);
    ctx.lineTo(GOAL_WIDTH, CANVAS_HEIGHT - GOAL_HEIGHT - 20);
    ctx.stroke();

    // Right goal
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH, CANVAS_HEIGHT - 20);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GOAL_HEIGHT - 20);
    ctx.lineTo(CANVAS_WIDTH - GOAL_WIDTH, CANVAS_HEIGHT - GOAL_HEIGHT - 20);
    ctx.stroke();

    // Draw players
    const drawPlayer = (player: Player) => {
      // Body
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y + 30, player.width, player.height - 30);

      // Head (bigger)
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + 20, 25, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(
        player.x + player.width / 2 - 8,
        player.y + 15,
        4,
        0,
        Math.PI * 2
      );
      ctx.arc(
        player.x + player.width / 2 + 8,
        player.y + 15,
        4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(
        player.x + player.width / 2 - 8,
        player.y + 15,
        2,
        0,
        Math.PI * 2
      );
      ctx.arc(
        player.x + player.width / 2 + 8,
        player.y + 15,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    };

    drawPlayer(playerRef.current);
    drawPlayer(aiPlayerRef.current);

    // Draw ball
    const ball = ballRef.current;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball pattern
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.moveTo(ball.x - ball.radius, ball.y);
    ctx.lineTo(ball.x + ball.radius, ball.y);
    ctx.moveTo(ball.x, ball.y - ball.radius);
    ctx.lineTo(ball.x, ball.y + ball.radius);
    ctx.stroke();
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState.gameRunning) {
      updatePhysics();
    }
    render();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameRunning, updatePhysics, render]);

  // Start game loop
  useEffect(() => {
    gameLoop();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGame();
    };
  }, [stopGame]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 font-bold text-4xl text-foreground">
            Head Soccer
          </h1>
          <p className="text-muted-foreground">
            Player 1: W/A/D keys | AI Player: Automatic
          </p>
        </div>

        {/* Score and Timer */}
        <div className="mb-4 flex items-center justify-between">
          <Card className="p-4">
            <div className="text-center">
              <div className="font-bold text-2xl text-primary">
                {gameState.player1Score}
              </div>
              <div className="text-muted-foreground text-sm">Player 1</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="font-bold text-3xl text-foreground">
                {formatTime(gameState.timeLeft)}
              </div>
              <div className="text-muted-foreground text-sm">Time Left</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <div className="font-bold text-2xl text-destructive">
                {gameState.player2Score}
              </div>
              <div className="text-muted-foreground text-sm">AI Player</div>
            </div>
          </Card>
        </div>

        {/* Game Canvas */}
        <div className="mb-4 flex justify-center">
          <canvas
            className="rounded-lg border-2 border-border bg-card shadow-lg"
            height={CANVAS_HEIGHT}
            ref={canvasRef}
            width={CANVAS_WIDTH}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!(gameState.gameRunning || gameState.gameOver) && (
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={startGame}
              size="lg"
            >
              Start Game
            </Button>
          )}

          {gameState.gameRunning && (
            <Button onClick={stopGame} size="lg" variant="destructive">
              Stop Game
            </Button>
          )}

          {gameState.gameOver && (
            <div className="text-center">
              <div className="mb-4 font-bold text-2xl text-foreground">
                Game Over!{" "}
                {gameState.winner === "Tie"
                  ? "It's a tie!"
                  : `${gameState.winner} wins!`}
              </div>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={startGame}
                size="lg"
              >
                Play Again
              </Button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-6 p-4">
          <h3 className="mb-2 font-semibold text-foreground">How to Play:</h3>
          <ul className="space-y-1 text-muted-foreground text-sm">
            <li>• Use W to jump, A to move left, D to move right</li>
            <li>• Hit the ball with your head or body to score goals</li>
            <li>• Press W while hitting the ball for a super shot!</li>
            <li>• First to score the most goals in 60 seconds wins</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
