"use server";

/**
 * @fileOverview Refines a user's game idea into a more detailed prompt for the game generation AI.
 *
 * - refinePrompt - A function that takes a user's prompt and returns a refined version.
 * - RefinePromptInput - The input type for the refinePrompt function.
 * - RefinePromptOutput - The return type for the refinePrompt function.
 */

import { z } from "genkit";
import { ai } from "@/ai/genkit";

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

export function refinePrompt(
  input: RefinePromptInput
): Promise<RefinePromptOutput> {
  return refinePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: "refinePrompt",
  input: { schema: RefinePromptInputSchema },
  output: { schema: RefinePromptOutputSchema },
  prompt: `You are an expert prompt engineer for a game-generating AI.

{{#if isGameGenerated}}
Your task is to take a user's feedback or request for a change and rephrase it into a clear, concise, and actionable instruction for the game-generating AI, which will be updating existing code.

User's Feedback: "{{{prompt}}}"

Refine this feedback into a direct instruction for the AI. For example:
- If the user says "the ball is too slow", you should output "Increase the ball's speed."
- If the user says "add a score", you should output "Add a score counter that increments when the player successfully completes an action."
- If the user says "the player can move off the screen", you should output "Add boundary checks to prevent the player from moving outside the game canvas."
{{else}}
Your task is to take a user's simple game idea and expand it into a detailed, structured prompt. The refined prompt should guide the AI to create a polished, playable game within a single HTML file using HTML Canvas for rendering.

User's Idea: "{{{prompt}}}"

Refine this idea into a detailed prompt. The refined prompt must include:
1.  **Core Concept**: A clear, one-sentence summary of the game.
2.  **Gameplay Mechanics**: Detailed description of how the game is played, including player actions (e.g., moving, jumping, shooting), objectives, scoring, and win/loss conditions.
3.  **Visual Style**: A description of the desired aesthetics (e.g., "minimalist with a neon color palette," "retro 8-bit pixel art," "clean and modern with soft gradients").
4.  **Controls**: Explicitly mention both keyboard (e.g., "Arrow keys for movement, Spacebar to jump") and on-screen touch controls for mobile.
5.  **UI Elements**: Specify the necessary UI components like a start screen, a score display, lives/health indicator, and a game-over screen with a restart button.
{{/if}}

The final output should be only the refined prompt, ready to be fed into the game generation AI.`,
});

const refinePromptFlow = ai.defineFlow(
  {
    name: "refinePromptFlow",
    inputSchema: RefinePromptInputSchema,
    outputSchema: RefinePromptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (output === undefined || output === null) {
      throw new Error("refinePromptFlow: prompt returned no output.");
    }
    return output;
  }
);
