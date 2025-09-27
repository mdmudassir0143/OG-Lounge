// Type definitions for AI SDK integration
export type {
  GenerateGameCodeInput,
  GenerateGameCodeOutput,
} from "@/ai/flows/generate-game-code-ai-sdk";
export type {
  RefinePromptInput,
  RefinePromptOutput,
} from "@/ai/flows/refine-prompt-ai-sdk";

// Additional types for advanced features
export type GameVariation = {
  variation: number;
  title: string;
  description: string;
  uniqueFeature: string;
  difficulty: "easy" | "medium" | "hard";
};

export type GameIdea = {
  title: string;
  concept: string;
  mechanics: string[];
  controls: {
    keyboard: string[];
    touch: string[];
  };
  visualStyle: string;
  objective: string;
  features: string[];
  technicalRequirements: string[];
};

export type GameAnalysis = {
  currentFeatures: string[];
  issues: string[];
  improvementPlan: string;
};

export type ImprovedGame = {
  html: string;
  changes: string[];
  reasoning: string;
};

export type GameRefinementResult = {
  analysis: GameAnalysis;
  improvedGame: ImprovedGame;
};

export type GameMetrics = {
  duration: number;
  success: boolean;
  timestamp: string;
  error?: string;
};

export type GameGenerationResult = {
  html: string;
  description: string;
  metrics: GameMetrics;
};
