import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { OPENROUTER_CONFIG, validateOpenRouterConfig } from "../../config/openrouter";
import { ResumeGenerationException, ResumeGenerationError } from "../../types";

// Initialize LangChain LLM with OpenRouter (lazy initialization)
let llmInstance: ChatOpenAI | null = null;

export const getLLM = (): ChatOpenAI => {
  if (!llmInstance) {
    if (!validateOpenRouterConfig()) {
      throw new ResumeGenerationException(
        ResumeGenerationError.OPENROUTER_API_ERROR,
        'OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable.'
      );
    }

    llmInstance = new ChatOpenAI({
      apiKey: OPENROUTER_CONFIG.apiKey,
      model: OPENROUTER_CONFIG.defaultModel,
      temperature: OPENROUTER_CONFIG.temperature,
      maxTokens: OPENROUTER_CONFIG.maxTokens,
      streaming: OPENROUTER_CONFIG.streaming,
      configuration: {
        baseURL: OPENROUTER_CONFIG.baseURL
      }
    });
  }

  return llmInstance;
};

// Utility function to run chains with error handling
export const runChain = async <T>(
  chainFactory: () => Promise<RunnableSequence<any, T>> | RunnableSequence<any, T>,
  input: any
): Promise<T> => {
  try {
    const chain = await chainFactory();
    return await chain.invoke(input);
  } catch (error) {
    throw new ResumeGenerationException(
      ResumeGenerationError.OPENROUTER_API_ERROR,
      `Chain execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
};

