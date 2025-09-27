/**
 * @fileOverview Example configurations for different AI providers using Vercel AI SDK
 *
 * This file demonstrates how to configure various AI providers.
 * Copy the configuration you want to use into ai/config.ts
 */

import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
// import { anthropic } from '@ai-sdk/anthropic';
// import { cohere } from '@ai-sdk/cohere';

// Google AI Configuration (Free tier available)
export const googleConfig = {
  model: google("gemini-2.0-flash-exp"),
  temperature: 0.7,
  description: "Google Gemini - Fast and capable, free tier available",
};

// OpenAI Configuration (Paid)
export const openaiConfig = {
  model: openai("gpt-4o"),
  temperature: 0.7,
  description: "OpenAI GPT-4o - Most capable model, paid only",
};

// Alternative OpenAI models
export const openaiAlternatives = {
  gpt4: openai("gpt-4"),
  gpt35: openai("gpt-3.5-turbo"),
  gpt4mini: openai("gpt-4o-mini"), // Cheaper option
};

// Anthropic Configuration (Paid)
// export const anthropicConfig = {
//   model: anthropic('claude-3-5-sonnet-20241022'),
//   temperature: 0.7,
//   description: 'Anthropic Claude - Excellent reasoning, paid only'
// };

// Cohere Configuration (Free tier available)
// export const cohereConfig = {
//   model: cohere('command-r-plus'),
//   temperature: 0.7,
//   description: 'Cohere Command - Good performance, free tier available'
// };

// Usage Instructions:
// 1. Choose one of the configurations above
// 2. Copy the model configuration to ai/config.ts
// 3. Make sure you have the appropriate API key in your .env.local file
// 4. Install the required provider package if not already installed

// Example ai/config.ts content:
/*
import { google } from '@ai-sdk/google';

export const aiModel = google('gemini-2.0-flash-exp');

export const aiConfig = {
  model: aiModel,
  temperature: 0.7,
};
*/

// Required environment variables for each provider:
/*
# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# OpenAI  
OPENAI_API_KEY=your_openai_api_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# Cohere
COHERE_API_KEY=your_cohere_api_key
*/
