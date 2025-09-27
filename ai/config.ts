import { google } from "@ai-sdk/google";
// import { openai } from '@ai-sdk/openai';

// Configure your preferred AI model here
export const aiModel = google("gemini-2.5-flash");

// Alternative models you can use:
// export const aiModel = openai('gpt-4o');
// export const aiModel = google('gemini-1.5-pro');

export const aiConfig = {
  model: aiModel,
  // Add any global configuration here
  temperature: 0.7,
  maxTokens: 8192,
};
