"use server";

import { toast } from "sonner";
import { z } from "zod";
import {
  generateGameCodeStream,
  generateGameIdea,
  generateGameVariations,
  generateGameWithFallback,
  generateGameWithMetrics,
  refineGameWithReasoning,
} from "@/ai/advanced-utils";
import {
  type GenerateGameCodeInput,
  type GenerateGameCodeOutput,
  generateGameCode,
} from "@/ai/flows/generate-game-code-ai-sdk";
import {
  type RefinePromptInput,
  type RefinePromptOutput,
  refinePrompt,
} from "@/ai/flows/refine-prompt-ai-sdk";
import type {
  GameGenerationResult,
  GameIdea,
  GameRefinementResult,
  GameVariation,
} from "@/types/ai-sdk";

const GenerateGameCodeInputSchema = z.object({
  prompt: z.string().describe("A description of the game concept."),
  previousHtml: z.string().optional(),
});

const RefinePromptInputSchema = z.object({
  prompt: z.string().describe("The user-provided game idea or concept."),
  isGameGenerated: z
    .boolean()
    .optional()
    .describe("A flag to indicate if a game has already been generated."),
});

// Enhanced game generation with metrics and fallback
export async function generateGameEnhanced(
  input: GenerateGameCodeInput
): Promise<GameGenerationResult> {
  const validatedInput = GenerateGameCodeInputSchema.parse(input);
  try {
    // Use the proper game generation function first
    const gameResult = await generateGameCode(validatedInput);

    // Return with metrics
    return {
      html: gameResult.html,
      description: gameResult.description,
      metrics: {
        duration: 0, // We don't have timing here, but function worked
        success: true,
        timestamp: new Date().toISOString(),
      },
    };
  } catch {
    toast.error("Primary generation failed, attempting fallback method...", {
      duration: 4000,
    });
    // Try with metrics function as fallback
    try {
      const result = await generateGameWithMetrics(
        `${validatedInput.prompt}${
          validatedInput.previousHtml
            ? `\n\nPrevious HTML:\n${validatedInput.previousHtml}`
            : ""
        }`
      );
      return result;
    } catch (fallbackError) {
      throw new Error(
        "Failed to generate game. The AI model might be unavailable."
      );
    }
  }
}

// Original simple generation (for backward compatibility)
export async function generateGame(
  input: GenerateGameCodeInput
): Promise<GenerateGameCodeOutput> {
  const validatedInput = GenerateGameCodeInputSchema.parse(input);
  try {
    const result = await generateGameCode(validatedInput);
    return result;
  } catch {
    // Try fallback generation
    toast.error("Primary generation failed, attempting fallback method...", {
      duration: 4000,
    });
    try {
      const fallbackResult = await generateGameWithFallback(
        validatedInput.prompt,
        validatedInput.previousHtml
      );

      // Check if it's a generateText result (string) or generateObject result
      if ("text" in fallbackResult) {
        return {
          html: fallbackResult.text,
          description: "Generated using fallback method due to initial failure",
        };
      }
      return {
        html: fallbackResult.object.html,
        description: fallbackResult.object.description,
      };
    } catch (fallbackError) {
      console.error("Fallback generation also failed:", fallbackError);
      throw new Error(
        "Failed to generate game. The AI model might be unavailable."
      );
    }
  }
}

// Advanced refinement with reasoning
export async function refineGameAdvanced(
  gameHtml: string,
  feedback: string
): Promise<GameRefinementResult> {
  try {
    const result = await refineGameWithReasoning(gameHtml, feedback);
    return result;
  } catch (error) {
    console.error("Error refining game:", error);
    throw new Error(
      "Failed to refine game. The AI model might be unavailable."
    );
  }
}

// Prompt refinement action
export async function refinePromptAction(
  input: RefinePromptInput
): Promise<RefinePromptOutput> {
  const validatedInput = RefinePromptInputSchema.parse(input);
  try {
    const result = await refinePrompt(validatedInput);
    return result;
  } catch (error) {
    console.error("Error refining prompt:", error);
    throw new Error(
      "Failed to refine prompt. The AI model might be unavailable."
    );
  }
}

// Generate creative game ideas
export async function generateGameIdeaAction(
  theme: string,
  difficulty: "simple" | "medium" | "complex" = "medium",
  creativity = 0.7
): Promise<GameIdea> {
  try {
    const result = await generateGameIdea(theme, difficulty, creativity);
    return result;
  } catch (error) {
    console.error("Error generating game idea:", error);
    throw new Error(
      "Failed to generate game idea. The AI model might be unavailable."
    );
  }
}

// Generate multiple game variations
export async function generateGameVariationsAction(
  basePrompt: string,
  variationCount = 3
): Promise<GameVariation[]> {
  try {
    const result = await generateGameVariations(basePrompt, variationCount);
    return result;
  } catch (error) {
    console.error("Error generating game variations:", error);
    throw new Error(
      "Failed to generate game variations. The AI model might be unavailable."
    );
  }
}

// Streaming game generation (returns stream)
export async function generateGameStream(prompt: string) {
  try {
    const stream = await generateGameCodeStream(prompt);
    return stream;
  } catch (error) {
    console.error("Error generating game stream:", error);
    throw new Error(
      "Failed to generate game stream. The AI model might be unavailable."
    );
  }
}
