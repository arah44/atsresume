import OpenAI from 'openai';

/**
 * OpenAI configuration
 * Used for features that require direct OpenAI access (not via OpenRouter)
 * like the Responses API for PDF parsing
 */
export const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  models: {
    gpt4o: 'gpt-4o',
    gpt4oMini: 'gpt-4o-mini',
    gpt5: 'gpt-5',
    gpt5Mini: 'gpt-5-mini',
    gpt5nano: 'gpt-5-nano',
  },
  defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-5-mini', // Best for PDF parsing
};

let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client instance (singleton)
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!OPENAI_CONFIG.apiKey) {
      throw new Error(
        'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.'
      );
    }

    openaiClient = new OpenAI({
      apiKey: OPENAI_CONFIG.apiKey,
    });
  }

  return openaiClient;
}

/**
 * Validate OpenAI configuration
 */
export function validateOpenAIConfig(): boolean {
  if (!OPENAI_CONFIG.apiKey) {
    throw new Error(
      'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.'
    );
  }
  return true;
}

