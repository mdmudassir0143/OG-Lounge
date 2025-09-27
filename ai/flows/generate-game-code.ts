"use server";

/**
 * @fileOverview Generates game code from a user prompt.
 *
 * - generateGameCode - A function that generates or refines a single HTML file for a basic playable game based on a user prompt and optional previous code.
 * - GenerateGameCodeInput - The input type for the generateGameCode function.
 * - GenerateGameCodeOutput - The return type for the generateGameCode function.
 */

import { z } from "genkit";
import { ai } from "@/ai/genkit";

const GenerateGameCodeInputSchema = z.object({
  prompt: z
    .string()
    .describe("A description of the game concept or feedback for refinement."),
  previousHtml: z
    .string()
    .optional()
    .describe(
      "The full HTML (including CSS and JS) of the previous game version."
    ),
});
export type GenerateGameCodeInput = z.infer<typeof GenerateGameCodeInputSchema>;

const GenerateGameCodeOutputSchema = z.object({
  html: z
    .string()
    .describe(
      "The complete HTML code for the game, with CSS embedded in a <style> tag and JavaScript in a <script> tag."
    ),
  description: z
    .string()
    .describe(
      "A summary of the changes made to the code in this generation step, explaining what was created or modified."
    ),
});
export type GenerateGameCodeOutput = z.infer<
  typeof GenerateGameCodeOutputSchema
>;

export async function generateGameCode(
  input: GenerateGameCodeInput
): Promise<GenerateGameCodeOutput> {
  return await generateGameCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateGameCodePrompt",
  input: { schema: GenerateGameCodeInputSchema },
  output: { schema: GenerateGameCodeOutputSchema },
  prompt: `You are an expert game developer and front-end designer.

Your task is to create or improve a complete browser-based 2D game within a single HTML file. The CSS must be inside a <style> tag in the <head>, and the JavaScript must be inside a <script> tag at the end of the <body>. The game must be visually polished, functional on first load, and support both keyboard and mobile (touch) controls.

{{#if previousHtml}}
You will improve an existing game based on the feedback below.

Previous HTML Code:
---
{{{previousHtml}}}
---

User Feedback:
"{{{prompt}}}"

First, provide a short summary of the changes you are about to make.
Then, generate the **complete, updated** single HTML file containing the new HTML, CSS, and JavaScript.
{{else}}
First, provide a short summary of the game you are about to create.
Then, generate a **new, complete single HTML file** containing all HTML, CSS, and JavaScript for a game based on this description: "{{{prompt}}}"
{{/if}}

### ✅ Requirements & Guidelines

1. **Single File Structure**:
   - All code must be in one HTML file.
   - CSS must be in a \`<style>\` tag within the \`<head>\`.
   - JavaScript must be in a \`<script>\` tag just before the closing \`</body>\` tag.
   - Use \`<canvas>\` for rendering the game.

2. **Design & Aesthetics**
   - Create a **modern**, clean, and **visually attractive** game.
   - Use **gradients**, soft shadows, rounded corners, and smooth animations.
   - Include a **start screen**, **score/lives HUD**, and **game-over screen**.
   - Use beautiful typography and color schemes.

3. **Gameplay**
   - Ensure the game is **fully playable on first load**, no missing assets or code.
   - Provide **default instructions** (e.g., “Use arrow keys / tap buttons to play”).

4. **Input Support**
   - Implement **keyboard controls** for desktop (WASD, arrow keys, space, etc.).
   - Add **on-screen touch buttons** for mobile (e.g., arrows, jump button).
   - Ensure input responsiveness is smooth across devices.

5. **Responsiveness**
   - Layout must be **responsive** (fit both desktop and mobile without layout issues).
   - All UI elements must scale/adapt appropriately.

6. **No Dependencies**
   - Use **pure HTML, CSS, and JavaScript**. No external libraries or frameworks.

7. **Code Quality**
   - Do not add comments in code.
   - Ensure the generated code is complete and ready to run without errors.

8. **Compatibility**
   - Must work in all major browsers (Chrome, Firefox, Safari, Edge) without errors.
   - Load and run successfully **without requiring any edits**.

---

### 🧩 Output Format:

Description:
---
{{output.description}}

HTML:
---
{{output.html}}
`,
});

const generateGameCodeFlow = ai.defineFlow(
  {
    name: "generateGameCodeFlow",
    inputSchema: GenerateGameCodeInputSchema,
    outputSchema: GenerateGameCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI prompt returned no output");
    }
    return output;
  }
);
