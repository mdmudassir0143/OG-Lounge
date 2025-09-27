"use server";

/**
 * @fileOverview Advanced AI utilities using Vercel AI SDK
 *
 * This file demonstrates advanced features like streaming, tool usage,
 * and multi-step reasoning that are possible with the AI SDK.
 */

import { generateObject, generateText, streamText } from "ai";
import { z } from "zod";
import { aiModel } from "@/ai/config";

// Streaming version for real-time game generation
export function generateGameCodeStream(prompt: string) {
  const result = streamText({
    model: aiModel,
    prompt: `Generate a complete HTML5 game based on this prompt: ${prompt}
    
    Include all HTML, CSS, and JavaScript in a single file.
    Make the game responsive and include touch controls for mobile.`,
    temperature: 0.7,
  });

  return result.textStream;
}

// Multi-step game refinement with reasoning
export async function refineGameWithReasoning(
  gameHtml: string,
  feedback: string
) {
  // Step 1: Analyze the current game
  const analysis = await generateObject({
    model: aiModel,
    schema: z.object({
      currentFeatures: z
        .array(z.string())
        .describe("List of current game features"),
      issues: z
        .array(z.string())
        .describe("Identified issues in the current game"),
      improvementPlan: z
        .string()
        .describe("Plan for improvements based on feedback"),
    }),
    prompt: `Analyze this HTML5 game and the user feedback:
    
    Game HTML:
    ${gameHtml}
    
    User Feedback:
    ${feedback}
    
    Provide a detailed analysis of the current game and improvement plan.`,
  });

  // Step 2: Generate improved version
  const improvedGame = await generateObject({
    model: aiModel,
    schema: z.object({
      html: z.string().describe("The improved HTML5 game code"),
      changes: z.array(z.string()).describe("List of specific changes made"),
      reasoning: z
        .string()
        .describe("Explanation of why these changes were made"),
    }),
    prompt: `Based on this analysis, improve the game:
    
    Current Features: ${analysis.object.currentFeatures.join(", ")}
    Issues: ${analysis.object.issues.join(", ")}
    Improvement Plan: ${analysis.object.improvementPlan}
    
    Original Game:
    ${gameHtml}
    
    User Feedback:
    ${feedback}
    
    Generate the improved game with complete HTML, CSS, and JavaScript.`,
  });

  return {
    analysis: analysis.object,
    improvedGame: improvedGame.object,
  };
}

// Game idea generator with creativity controls
export async function generateGameIdea(
  theme: string,
  difficulty: "simple" | "medium" | "complex" = "medium",
  creativity = 0.7
) {
  const complexityGuide = {
    simple:
      "Use basic mechanics like clicking, simple movement, or matching. Suitable for beginners.",
    medium:
      "Include intermediate mechanics like physics, collision detection, or basic AI. Good balance of fun and complexity.",
    complex:
      "Advanced mechanics like procedural generation, complex AI, or multiple game systems. For experienced players.",
  };

  const result = await generateObject({
    model: aiModel,
    schema: z.object({
      title: z.string().describe("Creative game title"),
      concept: z.string().describe("One-sentence game concept"),
      mechanics: z.array(z.string()).describe("Core gameplay mechanics"),
      controls: z.object({
        keyboard: z.array(z.string()).describe("Keyboard controls"),
        touch: z.array(z.string()).describe("Touch/mobile controls"),
      }),
      visualStyle: z.string().describe("Visual design and art style"),
      objective: z.string().describe("Win condition and player goal"),
      features: z.array(z.string()).describe("Key game features"),
      technicalRequirements: z
        .array(z.string())
        .describe("Technical implementation notes"),
    }),
    prompt: `Generate a creative ${difficulty} game idea based on the theme: "${theme}"
    
    Complexity Level: ${difficulty}
    ${complexityGuide[difficulty]}
    
    Create an engaging, unique game concept that would be fun to play and technically feasible to implement in HTML5/Canvas.`,
    temperature: creativity,
  });

  return result.object;
}

// Batch processing for multiple game variations
export async function generateGameVariations(
  basePrompt: string,
  variationCount = 3
) {
  const variations = await Promise.all(
    Array.from({ length: variationCount }, async (_, index) => {
      const result = await generateObject({
        model: aiModel,
        schema: z.object({
          title: z.string(),
          description: z.string(),
          uniqueFeature: z.string(),
          difficulty: z.enum(["easy", "medium", "hard"]),
        }),
        prompt: `Create variation ${index + 1} of this game concept: "${basePrompt}"
        
        Make each variation unique by changing one major aspect (theme, mechanics, visual style, or objective).
        Keep the core concept recognizable but add a unique twist.`,
        temperature: 0.8,
      });

      return {
        variation: index + 1,
        ...result.object,
      };
    })
  );

  return variations;
}

// Error recovery and fallback generation
export async function generateGameWithFallback(
  prompt: string,
  previousAttempt?: string
) {
  try {
    // Primary attempt with full features
    return await generateObject({
      model: aiModel,
      schema: z.object({
        html: z.string(),
        description: z.string(),
        features: z.array(z.string()),
      }),
      prompt: `Generate a complete HTML5 game: ${prompt}
      
      ${previousAttempt ? `Previous attempt had issues. Improve upon: ${previousAttempt}` : ""}
      
      Include all necessary HTML, CSS, and JavaScript in a single file.`,
      temperature: 0.7,
    });
  } catch {
    // Fallback with simpler requirements
    return await generateText({
      model: aiModel,
      prompt: `Generate a simple HTML5 game: ${prompt}
      
      Keep it basic but functional. Return only the HTML code with embedded CSS and JavaScript.`,
      temperature: 0.5,
    });
  }
}

// Performance monitoring for AI calls
export async function generateGameWithMetrics(prompt: string) {
  const startTime = Date.now();

  try {
    const result = await generateObject({
      model: aiModel,
      schema: z.object({
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
      }),
      prompt: `You are an expert game developer and front-end designer.

Your task is to create a complete browser-based 2D game within a single HTML file. The CSS must be inside a <style> tag in the <head>, and the JavaScript must be inside a <script> tag at the end of the <body>. The game must be visually polished, functional on first load, and support both keyboard and mobile (touch) controls.

Game Description: ${prompt}

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
   - Provide **default instructions** (e.g., "Use arrow keys / tap buttons to play").

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

Generate the complete HTML code for the game.`,
      temperature: 0.7,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      ...result.object,
      metrics: {
        duration,
        success: true,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      html: "",
      description: "Generation failed",
      metrics: {
        duration,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
    };
  }
}
