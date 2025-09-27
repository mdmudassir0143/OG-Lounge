"use server";

/**
 * @fileOverview Refines a user's game idea into a more detailed prompt using Vercel AI SDK.
 *
 * - refinePrompt - A function that takes a user's prompt and returns a refined version.
 * - RefinePromptInput - The input type for the refinePrompt function.
 * - RefinePromptOutput - The return type for the refinePrompt function.
 */

import { generateObject } from "ai";
import { z } from "zod";
import { aiModel } from "@/ai/config";

const RefinePromptInputSchema = z.object({
  prompt: z.string().describe("The user-provided game idea or concept."),
  isGameGenerated: z
    .boolean()
    .optional()
    .describe("A flag to indicate if a game has already been generated."),
});
export type RefinePromptInput = z.infer<typeof RefinePromptInputSchema>;

const RefinePromptOutputSchema = z.object({
  refinedPrompt: z
    .string()
    .describe(
      "The refined, detailed prompt suitable for the game generation AI."
    ),
});
export type RefinePromptOutput = z.infer<typeof RefinePromptOutputSchema>;

function createRefinePrompt(input: RefinePromptInput): string {
  const basePrompt =
    "You are an expert prompt engineer for a game-generating AI.";

  if (input.isGameGenerated) {
    return `${basePrompt}

Your task is to take a user's feedback or request for a change and rephrase it into a clear, concise, and actionable instruction for the game-generating AI, which will be updating existing code.

User's Feedback: "${input.prompt}"

Refine this feedback into a direct instruction for the AI. For example:
- If the user says "the ball is too slow", you should output "Increase the ball's speed."
- If the user says "add a score", you should output "Add a score counter that increments when the player successfully completes an action."
- If the user says "the player can move off the screen", you should output "Add boundary checks to prevent the player from moving outside the game canvas."

The final output should be only the refined prompt, ready to be fed into the game generation AI.`;
  }
  return `${basePrompt}

Your task is to take a user's simple game idea and expand it into a detailed, structured prompt. The refined prompt should guide the AI to create a polished, playable game within a single HTML file using HTML Canvas for rendering.

User's Idea: "${input.prompt}"

Refine this idea into a detailed prompt. The refined prompt must include:
1. **Core Concept**: A clear, one-sentence summary of the game.
2. **Gameplay Mechanics**: Detailed description of how the game is played, including player actions (e.g., moving, jumping, shooting), objectives, scoring, and win/loss conditions.
3. **Visual Style**: A description of the desired aesthetics (e.g., "minimalist with a neon color palette," "retro 8-bit pixel art," "clean and modern with soft gradients").
4. **Controls**: Explicitly mention both keyboard (e.g., "Arrow keys for movement, Spacebar to jump") and on-screen touch controls for mobile.
5. **UI Elements**: Specify the necessary UI components like a start screen, a score display, lives/health indicator, and a game-over screen with a restart button.

The final output should be only the refined prompt, ready to be fed into the game generation AI.`;
}

export async function refinePrompt(
  input: RefinePromptInput
): Promise<RefinePromptOutput> {
  try {
    const prompt = createRefinePrompt(input);

    const { object } = await generateObject({
      model: aiModel,
      schema: RefinePromptOutputSchema,
      prompt,
      temperature: 0.7,
    });

    return object;
  } catch {
    throw new Error(
      "Failed to refine prompt. The AI model might be unavailable."
    );
  }
}
