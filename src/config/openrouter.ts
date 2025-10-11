// OpenRouter configuration
export const OPENROUTER_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  models: {
    gpt4o: "openai/gpt-4o",
    gpt4turbo: "openai/gpt-4-turbo",
    gpt35: "openai/gpt-3.5-turbo",
    claude: "anthropic/claude-3-5-sonnet",
    gemini: "google/gemini-pro-1.5"
  },
  defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || "openai/gpt-5-mini", // GPT-4o has better structured output support
  temperature: 0.3,
  maxTokens: 4000,
  streaming: false, // Disabled for structured output compatibility
  timeout: 60000, // 60 seconds (increased for structured output)
  retries: 3
};

// Validate configuration - throws error if not configured
export const validateOpenRouterConfig = (): boolean => {
  if (!OPENROUTER_CONFIG.apiKey) {
    throw new Error(
      'OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable. ' +
      'You can get an API key from https://openrouter.ai/keys'
    );
  }
  return true;
};