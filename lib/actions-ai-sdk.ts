"use server";

import { z } from "zod";
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

const GenerateGameCodeInputSchema = z.object({
  prompt: z.string().describe("A description of the game concept."),
  previousHtml: z.string().optional(),
});

export async function generateGame(
  input: GenerateGameCodeInput
): Promise<GenerateGameCodeOutput> {
  const validatedInput = GenerateGameCodeInputSchema.parse(input);
  try {
    const result = await generateGameCode(validatedInput);
    return result;
  } catch {
    throw new Error(
      "Failed to generate game. The AI model might be unavailable."
    );
  }
}

const RefinePromptInputSchema = z.object({
  prompt: z.string().describe("The user-provided game idea or concept."),
  isGameGenerated: z
    .boolean()
    .optional()
    .describe("A flag to indicate if a game has already been generated."),
});

export async function refinePromptAction(
  input: RefinePromptInput
): Promise<RefinePromptOutput> {
  const validatedInput = RefinePromptInputSchema.parse(input);
  try {
    const result = await refinePrompt(validatedInput);
    return result;
  } catch {
    throw new Error(
      "Failed to refine prompt. The AI model might be unavailable."
    );
  }
}
