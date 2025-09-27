"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BarChart3,
  Lightbulb,
  Loader2,
  Shuffle,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  generateGameEnhanced,
  generateGameIdeaAction,
  generateGameVariationsAction,
  refineGameAdvanced,
  refinePromptAction,
} from "@/lib/actions-enhanced";
import {
  MAX_FEATURES_DISPLAY,
  PROMPT_READY_THRESHOLD,
  VARIATIONS_COUNT,
} from "@/lib/constants";
import type {
  GameGenerationResult,
  GameIdea,
  GameMetrics,
  GameRefinementResult,
  GameVariation,
  GenerateGameCodeOutput,
} from "@/types/ai-sdk";
import { Label } from "../ui/label";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  mode: z.enum(["simple", "advanced", "creative"]),
  difficulty: z.enum(["simple", "medium", "complex"]),
  creativity: z.number().min(0).max(1),
});

type EnhancedGameGeneratorDialogProps = {
  onGenerate: (output: GenerateGameCodeOutput) => void;
  children: React.ReactNode;
  html: string;
  isGameGenerated: boolean;
};

export function EnhancedGameGeneratorDialog({
  onGenerate,
  children,
  html,
  isGameGenerated,
}: EnhancedGameGeneratorDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRefining, setIsRefining] = React.useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = React.useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] =
    React.useState(false);
  const [activeTab, setActiveTab] = React.useState("generate");
  const [gameIdeas, setGameIdeas] = React.useState<GameIdea[]>([]);
  const [gameVariations, setGameVariations] = React.useState<GameVariation[]>(
    []
  );
  const [generationMetrics, setGenerationMetrics] =
    React.useState<GameMetrics | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      mode: "simple",
      difficulty: "medium",
      creativity: 0.7,
    },
  });

  const handleRefinePrompt = async () => {
    const currentPrompt = form.getValues("prompt");
    if (currentPrompt.length < 10) {
      form.setError("prompt", {
        type: "manual",
        message:
          "Please enter a game idea of at least 10 characters to refine.",
      });
      return;
    }

    setIsRefining(true);
    try {
      const result = await refinePromptAction({
        prompt: currentPrompt,
        isGameGenerated,
      });
      form.setValue("prompt", result.refinedPrompt, { shouldValidate: true });
      toast.success("Prompt Refined!", {
        description: "Your game idea has been enhanced with more detail.",
      });
    } catch {
      toast.error("Refinement Failed", {
        description:
          "There was an error refining the prompt. Please try again.",
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateIdea = async () => {
    const theme = form.getValues("prompt") || "random";
    const difficulty = form.getValues("difficulty");
    const creativity = form.getValues("creativity");

    setIsGeneratingIdea(true);
    try {
      const result = await generateGameIdeaAction(
        theme,
        difficulty,
        creativity
      );
      setGameIdeas([result]);
      form.setValue(
        "prompt",
        `${result.concept}\n\nFeatures: ${result.features.join(", ")}\nVisual Style: ${result.visualStyle}`,
        { shouldValidate: true }
      );

      // Switch to the Generate tab after generating an idea
      setActiveTab("generate");

      toast.success("Game Idea Generated!", {
        description: `${result.title} - Ready to generate game code!`,
      });
    } catch {
      toast.error("Idea Generation Failed", {
        description:
          "There was an error generating the game idea. Please try again.",
      });
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const handleGenerateVariations = async () => {
    const currentPrompt = form.getValues("prompt");
    if (currentPrompt.length < 10) {
      toast.error("Please enter a game concept first");
      return;
    }

    setIsGeneratingVariations(true);
    try {
      const result = await generateGameVariationsAction(
        currentPrompt,
        VARIATIONS_COUNT
      );
      setGameVariations(result);
      toast.success("Game Variations Generated!", {
        description: `${result.length} unique variations created`,
      });
    } catch {
      toast.error("Variation Generation Failed", {
        description:
          "There was an error generating variations. Please try again.",
      });
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  const handleAdvancedGeneration = async (
    values: z.infer<typeof formSchema>
  ) => {
    setIsGenerating(true);
    try {
      let result: GenerateGameCodeOutput;

      if (values.mode === "advanced" && isGameGenerated) {
        // Use advanced refinement with reasoning
        const refinementResult: GameRefinementResult = await refineGameAdvanced(
          html,
          values.prompt
        );
        result = {
          html: refinementResult.improvedGame.html,
          description: `${refinementResult.improvedGame.reasoning}\n\nChanges made:\n${refinementResult.improvedGame.changes.join("\n")}`,
        };

        toast.success("Advanced Refinement Complete!", {
          description: "Game analyzed and improved with detailed reasoning",
        });
      } else {
        // Use enhanced generation with metrics
        const enhancedResult: GameGenerationResult = await generateGameEnhanced(
          {
            prompt: values.prompt,
            previousHtml: isGameGenerated ? html : undefined,
          }
        );

        result = {
          html: enhancedResult.html,
          description: enhancedResult.description,
        };

        setGenerationMetrics(enhancedResult.metrics);

        toast.success("Enhanced Generation Complete!", {
          description: `Generated in ${enhancedResult.metrics.duration}ms`,
        });
      }

      onGenerate(result);
      setIsOpen(false);
      form.reset();
    } catch {
      toast.error("Generation Failed", {
        description:
          "There was an error generating the game. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.mode === "advanced") {
      return handleAdvancedGeneration(values);
    }

    // Default simple generation
    setIsGenerating(true);
    try {
      const enhancedResult = await generateGameEnhanced({
        prompt: values.prompt,
        previousHtml: isGameGenerated ? html : undefined,
      });

      onGenerate({
        html: enhancedResult.html,
        description: enhancedResult.description,
      });

      setGenerationMetrics(enhancedResult.metrics);
      setIsOpen(false);
      form.reset();

      toast.success(isGameGenerated ? "Game Refined!" : "Game Generated!", {
        description: `Completed in ${enhancedResult.metrics.duration}ms`,
      });
    } catch {
      toast.error("Generation Failed", {
        description:
          "There was an error generating the game. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const selectVariation = (variation: GameVariation) => {
    form.setValue(
      "prompt",
      `${variation.description}\n\nUnique Feature: ${variation.uniqueFeature}`,
      { shouldValidate: true }
    );

    // Switch to the Generate tab after selecting a variation
    setActiveTab("generate");

    toast.success("Variation Selected!", {
      description: `${variation.title} - Ready to generate game code!`,
    });
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {isGameGenerated ? "Enhance Your Game" : "AI Game Generator"}
              </DialogTitle>
              <DialogDescription asChild>
                <div>
                  Advanced AI-powered game generation with creative assistance
                  and detailed analysis.
                  <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                          1
                        </span>
                        Generate Ideas
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
                          2
                        </span>
                        Generate Game Code
                      </span>
                    </div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>

            <Tabs
              className="mt-4 w-full"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger className="relative" value="generate">
                  Generate
                  {form.watch("prompt") &&
                    form.watch("prompt").length > PROMPT_READY_THRESHOLD && (
                      <div className="-top-1 -right-1 absolute h-2 w-2 rounded-full bg-green-500" />
                    )}
                </TabsTrigger>
                <TabsTrigger value="ideas">💡 Ideas</TabsTrigger>
                <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-4" value="generate">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>
                          {isGameGenerated ? "Refinements" : "Game Concept"}
                          {form.watch("prompt") &&
                            form.watch("prompt").length >
                              PROMPT_READY_THRESHOLD && (
                              <Badge
                                className="ml-2 text-xs"
                                variant="secondary"
                              >
                                AI Generated
                              </Badge>
                            )}
                        </FormLabel>
                        <div className="flex gap-2">
                          <Button
                            disabled={isRefining || isGenerating}
                            onClick={handleRefinePrompt}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {isRefining ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Refine
                          </Button>
                        </div>
                      </div>
                      <FormControl>
                        <Textarea
                          className="min-h-[100px] resize-none"
                          placeholder={
                            isGameGenerated
                              ? "Describe improvements: make it faster, add power-ups, change colors..."
                              : "Describe your game: a platformer with jumping mechanics, puzzle elements..."
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {gameVariations.length > 0 && (
                  <div className="space-y-2">
                    <Label className="font-medium text-sm">
                      Game Variations
                    </Label>
                    <div className="grid max-h-48 gap-2 overflow-y-auto">
                      {gameVariations.map((variation) => (
                        <button
                          className="w-full cursor-pointer rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                          key={variation.variation}
                          onClick={() => selectVariation(variation)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              selectVariation(variation);
                            }
                          }}
                          type="button"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{variation.title}</h4>
                              <p className="text-muted-foreground text-sm">
                                {variation.description}
                              </p>
                              <p className="mt-1 text-accent-foreground text-xs">
                                {variation.uniqueFeature}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {variation.difficulty}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent className="space-y-4" value="ideas">
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={isGeneratingIdea}
                    onClick={handleGenerateIdea}
                    type="button"
                    variant="outline"
                  >
                    {isGeneratingIdea ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Lightbulb className="mr-2 h-4 w-4" />
                    )}
                    Generate Idea
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={isGeneratingVariations}
                    onClick={handleGenerateVariations}
                    type="button"
                    variant="outline"
                  >
                    {isGeneratingVariations ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Shuffle className="mr-2 h-4 w-4" />
                    )}
                    Variations
                  </Button>
                </div>

                {gameIdeas.length > 0 && (
                  <div className="space-y-3">
                    {gameIdeas.map((idea) => (
                      <div
                        className="space-y-2 rounded-lg border p-4"
                        key={idea.title}
                      >
                        <h3 className="font-bold">{idea.title}</h3>
                        <p className="text-sm">{idea.concept}</p>
                        <div className="flex flex-wrap gap-1">
                          {idea.features
                            .slice(0, MAX_FEATURES_DISPLAY)
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
                        <p className="text-muted-foreground text-xs">
                          {idea.visualStyle}
                        </p>
                      </div>
                    ))}

                    <div className="pt-2">
                      <Button
                        className="w-full"
                        onClick={() => setActiveTab("generate")}
                        variant="default"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Game Code
                      </Button>
                      <p className="mt-2 text-center text-muted-foreground text-xs">
                        Idea has been added to the prompt. Click to generate the
                        actual game code.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent className="space-y-4" value="settings">
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generation Mode</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select generation mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simple">
                            Simple - Fast generation
                          </SelectItem>
                          <SelectItem value="advanced">
                            Advanced - With analysis & reasoning
                          </SelectItem>
                          <SelectItem value="creative">
                            Creative - Maximum innovation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Complexity</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complexity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simple">
                            Simple - Basic mechanics
                          </SelectItem>
                          <SelectItem value="medium">
                            Medium - Balanced gameplay
                          </SelectItem>
                          <SelectItem value="complex">
                            Complex - Advanced features
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creativity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Creativity Level: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          className="w-full"
                          max={1}
                          min={0}
                          onValueChange={(value) => field.onChange(value[0])}
                          step={0.1}
                          value={[field.value]}
                        />
                      </FormControl>
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Conservative</span>
                        <span>Creative</span>
                      </div>
                    </FormItem>
                  )}
                />

                {generationMetrics && (
                  <div className="space-y-2 rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        Last Generation Metrics
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>Duration: {generationMetrics.duration}ms</div>
                      <div>
                        Status:{" "}
                        {generationMetrics.success ? "Success" : "Failed"}
                      </div>
                      <div>
                        Time:{" "}
                        {new Date(
                          generationMetrics.timestamp
                        ).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              {form.watch("prompt") &&
                form.watch("prompt").length > PROMPT_READY_THRESHOLD &&
                activeTab !== "generate" && (
                  <div className="mb-4 w-full text-center">
                    <p className="rounded bg-accent/10 p-2 text-muted-foreground text-xs">
                      🎯 Game concept ready! Switch to "Generate" tab to create
                      the game code.
                    </p>
                  </div>
                )}
              <Button
                className="min-w-[120px]"
                disabled={isGenerating || isRefining}
                type="submit"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    {form.watch("mode") === "advanced" ? (
                      <Zap className="mr-2 h-4 w-4" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    {isGameGenerated ? "Enhance Game" : "Generate Game Code"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
