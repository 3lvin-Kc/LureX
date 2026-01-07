/**
 * Gemini AI Client
 *
 * Implementation of AIProvider interface using Google's Gemini model
 * via Vercel AI SDK. Includes built-in rate limiting for free tier usage.
 */

import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import {
  AIProvider,
  AIResponse,
  AIStreamOptions,
  AIProviderConfig,
  AIProviderError,
  RateLimitError,
  QuotaExceededError,
  AuthenticationError,
  RateLimited,
} from "./ai-provider-interface";
import {
  RateLimiter,
  createGeminiRateLimiter,
  RateLimitStatus,
} from "./rate-limiter";

export interface GeminiConfig extends AIProviderConfig {
  model:
    | "gemini-2.5-pro"
    | "gemini-2.0-flash-exp"
    | "gemini-1.5-pro"
    | "gemini-1.5-flash";
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Gemini AI Client with rate limiting
 */
export class GeminiClient implements AIProvider, RateLimited {
  private rateLimiter: RateLimiter;
  private readonly identifier: string;

  constructor(private config: GeminiConfig) {
    this.rateLimiter = createGeminiRateLimiter();
    this.identifier = `gemini_${config.model}`;

    // Configure Google AI SDK
    if (!config.apiKey) {
      throw new AuthenticationError("gemini");
    }
  }

  getProviderName(): string {
    return "gemini";
  }

  getModel(): string {
    return this.config.model;
  }

  getConfig(): AIProviderConfig {
    return {
      ...this.config,
      apiKey: "***", // Hide API key in logs
    };
  }

  canMakeRequest(): boolean {
    const status = this.rateLimiter.getStatus(this.identifier);
    return status.allowed;
  }

  recordRequest(): void {
    this.rateLimiter.checkLimit(this.identifier);
  }

  getWaitTime(): number {
    const status = this.rateLimiter.getStatus(this.identifier);
    return status.retryAfter || 0;
  }

  isAvailable(): boolean {
    return this.canMakeRequest();
  }

  getRateLimitStatus() {
    const status = this.rateLimiter.getStatus(this.identifier);
    return {
      requestsRemaining: status.requestsRemaining,
      resetTime: status.resetTime,
      dailyRequestsRemaining: status.dailyRequestsRemaining,
      dailyResetTime: status.dailyResetTime,
    };
  }

  async streamGenerateWithRetry(
    prompt: string,
    options: AIStreamOptions = {},
    retries: number = 0,
    onToken?: (token: string) => void,
  ): Promise<AIResponse> {
    const maxRetries = this.config.maxRetries || 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check rate limits before making request
        const rateLimitStatus = this.rateLimiter.checkLimit(this.identifier);
        if (!rateLimitStatus.allowed) {
          throw new RateLimitError(
            "gemini",
            rateLimitStatus.retryAfter || 60000,
          );
        }

        if (onToken) {
          // Streaming mode
          return await this.streamGenerate(prompt, options, onToken);
        } else {
          // Non-streaming mode
          return await this.generate(prompt, options);
        }
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;

        if (error instanceof RateLimitError) {
          if (isLastAttempt) {
            throw error;
          }
          // Wait and retry for rate limit errors
          await this.sleep(error.retryAfter);
          continue;
        }

        if (error instanceof AIProviderError) {
          throw error;
        }

        // Handle other errors
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (
          errorMessage.includes("429") ||
          errorMessage.includes("rate limit")
        ) {
          const retryAfter = this.extractRetryAfter(errorMessage) || 60000;
          throw new RateLimitError("gemini", retryAfter);
        }

        if (
          errorMessage.includes("quota") ||
          errorMessage.includes("QUOTA_EXCEEDED")
        ) {
          throw new QuotaExceededError("gemini");
        }

        if (
          errorMessage.includes("401") ||
          errorMessage.includes("authentication")
        ) {
          throw new AuthenticationError("gemini");
        }

        if (isLastAttempt) {
          throw new AIProviderError(
            `Gemini request failed: ${errorMessage}`,
            "REQUEST_FAILED",
            "gemini",
            true,
          );
        }

        // Wait before retry
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }

    throw new AIProviderError(
      "Max retries exceeded",
      "MAX_RETRIES_EXCEEDED",
      "gemini",
      false,
    );
  }

  async generate(
    prompt: string,
    options: AIStreamOptions = {},
  ): Promise<AIResponse> {
    try {
      const model = google(this.config.model);

      const result = await generateText({
        model,
        prompt,
        maxOutputTokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.1,
      });

      return {
        content: result.text,
        model: this.config.model,
        usage: {
          promptTokens: result.usage?.inputTokens || 0,
          completionTokens: result.usage?.outputTokens || 0,
          totalTokens:
            (result.usage?.inputTokens || 0) +
            (result.usage?.outputTokens || 0),
        },
        finishReason: result.finishReason || "stop",
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async streamGenerate(
    prompt: string,
    options: AIStreamOptions,
    onToken: (token: string) => void,
  ): Promise<AIResponse> {
    try {
      const model = google(this.config.model);

      const result = streamText({
        model,
        prompt,
        maxOutputTokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.1,
      });

      let fullText = "";

      for await (const delta of result.textStream) {
        fullText += delta;
        onToken(delta);
      }

      const finalUsage = await result.usage;
      const finishReason = await result.finishReason;

      return {
        content: fullText,
        model: this.config.model,
        usage: {
          promptTokens: finalUsage?.inputTokens || 0,
          completionTokens: finalUsage?.outputTokens || 0,
          totalTokens:
            (finalUsage?.inputTokens || 0) + (finalUsage?.outputTokens || 0),
        },
        finishReason: finishReason || "stop",
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Simple test prompt
      const testPrompt =
        "Say 'connection test successful' in exactly those words.";
      const response = await this.generate(testPrompt, {});
      return response.content
        .toLowerCase()
        .includes("connection test successful");
    } catch (error) {
      console.error("Gemini connection test failed:", error);
      return false;
    }
  }

  private handleError(error: unknown): AIProviderError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      const retryAfter = this.extractRetryAfter(errorMessage) || 60000;
      return new RateLimitError("gemini", retryAfter);
    }

    if (
      errorMessage.includes("quota") ||
      errorMessage.includes("QUOTA_EXCEEDED")
    ) {
      return new QuotaExceededError("gemini");
    }

    if (
      errorMessage.includes("401") ||
      errorMessage.includes("authentication")
    ) {
      return new AuthenticationError("gemini");
    }

    return new AIProviderError(
      `Gemini error: ${errorMessage}`,
      "PROVIDER_ERROR",
      "gemini",
      true,
    );
  }

  private extractRetryAfter(errorMessage: string): number | null {
    // Try to extract retry-after from error message
    const retryAfterMatch = errorMessage.match(/retry[- ]after[:\s]+(\d+)/i);
    if (retryAfterMatch) {
      return parseInt(retryAfterMatch[1]) * 1000; // Convert seconds to milliseconds
    }

    // Try to extract from rate limit reset time
    const resetMatch = errorMessage.match(/reset[- ]in[:\s]+(\d+)/i);
    if (resetMatch) {
      return parseInt(resetMatch[1]) * 1000;
    }

    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a Gemini client with default configuration
 */
export function createGeminiClient(apiKey?: string): GeminiClient {
  const key =
    apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error(
      "Gemini API key not found. Set GOOGLE_API_KEY or GEMINI_API_KEY environment variable.",
    );
  }

  return new GeminiClient({
    model: "gemini-2.5-pro",
    apiKey: key,
    timeout: 30000,
    maxRetries: 2,
  });
}

/**
 * Create a Gemini client with custom configuration
 */
export function createCustomGeminiClient(config: GeminiConfig): GeminiClient {
  return new GeminiClient(config);
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!defaultClient) {
    defaultClient = createGeminiClient();
  }
  return defaultClient;
}
