"use client";

import {
  BarChart3,
  CheckCircle,
  Clock,
  Lightbulb,
  Shuffle,
  Wand2,
  XCircle,
  Zap,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  generateGameEnhanced,
  generateGameIdeaAction,
  generateGameVariationsAction,
} from "@/lib/actions-enhanced";
import {
  GAME_IDEA_FEATURES_DISPLAY_LIMIT,
  IDEATION_TEMPERATURE,
  VARIATIONS_COUNT,
} from "@/lib/constants";
import type {
  GameGenerationResult,
  GameIdea,
  GameMetrics,
  GameVariation,
} from "@/types/ai-sdk";

export function AIFeaturesDemo() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [gameIdea, setGameIdea] = React.useState<GameIdea | null>(null);
  const [variations, setVariations] = React.useState<GameVariation[]>([]);
  const [metrics, setMetrics] = React.useState<GameMetrics | null>(null);

  const handleGenerateIdea = async () => {
    setIsLoading(true);
    try {
      const idea = await generateGameIdeaAction(
        "retro arcade",
        "medium",
        IDEATION_TEMPERATURE
      );
      setGameIdea(idea);
      toast.success("Game Idea Generated!", {
        description: idea.title,
      });
    } catch {
      toast.error("Failed to generate game idea");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (!gameIdea) {
      return;
    }

    setIsLoading(true);
    try {
      const vars = await generateGameVariationsAction(
        gameIdea.concept,
        VARIATIONS_COUNT
      );
      setVariations(vars);
      toast.success("Variations Generated!", {
        description: `${vars.length} unique variations created`,
      });
    } catch {
      toast.error("Failed to generate variations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestGeneration = async () => {
    if (!gameIdea) {
      return;
    }

    setIsLoading(true);
    try {
      const result: GameGenerationResult = await generateGameEnhanced({
        prompt: gameIdea.concept,
      });
      setMetrics(result.metrics);
      toast.success("Generation Test Complete!", {
        description: `Completed in ${result.metrics.duration}ms`,
      });
    } catch {
      toast.error("Generation test failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text font-bold text-3xl text-transparent">
          AI-Enhanced Game Generator
        </h1>
        <p className="text-muted-foreground">
          Powered by Vercel AI SDK with advanced features for creative game
          development
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Creative Game Ideas
            </CardTitle>
            <CardDescription>
              Generate detailed game concepts with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={handleGenerateIdea}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Game Idea
            </Button>

            {gameIdea && (
              <div className="space-y-3 rounded-lg bg-muted p-4">
                <h3 className="font-bold">{gameIdea.title}</h3>
                <p className="text-sm">{gameIdea.concept}</p>
                <div className="flex flex-wrap gap-1">
                  {gameIdea.features
                    .slice(0, GAME_IDEA_FEATURES_DISPLAY_LIMIT)
                    .map((feature) => (
                      <Badge
                        className="text-xs"
                        key={feature}
                        variant="secondary"
                      >
                        {feature}
                      </Badge>
                    ))}
                </div>
                <div className="space-y-1 text-muted-foreground text-xs">
                  <div>
                    <strong>Style:</strong> {gameIdea.visualStyle}
                  </div>
                  <div>
                    <strong>Objective:</strong> {gameIdea.objective}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Game Variations
            </CardTitle>
            <CardDescription>
              Explore different takes on your game concept
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              disabled={isLoading || !gameIdea}
              onClick={handleGenerateVariations}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Generate Variations
            </Button>

            {variations.length > 0 && (
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {variations.map((variation) => (
                  <div
                    className="rounded-lg bg-muted p-3"
                    key={variation.variation}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">
                          {variation.title}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {variation.description}
                        </p>
                        <p className="text-accent-foreground text-xs">
                          {variation.uniqueFeature}
                        </p>
                      </div>
                      <Badge className="text-xs" variant="outline">
                        {variation.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Generation Features
          </CardTitle>
          <CardDescription>
            Enhanced AI capabilities with performance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            <Button
              disabled={isLoading || !gameIdea}
              onClick={handleTestGeneration}
              variant="outline"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Test Generation
            </Button>
            <Button disabled variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Stream Generation
            </Button>
            <Button disabled variant="outline">
              <Wand2 className="mr-2 h-4 w-4" />
              Multi-Step Analysis
            </Button>
          </div>

          {metrics && (
            <div className="space-y-3 rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Generation Metrics</span>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{metrics.duration}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  {metrics.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {metrics.success ? "Success" : "Failed"}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
                  {new Date(metrics.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Available Features:</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  Multi-provider AI support (Google, OpenAI, Anthropic)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Performance monitoring and metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Advanced prompt refinement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Game analysis and reasoning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Creative idea generation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Automatic fallback handling</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
