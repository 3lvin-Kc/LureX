/**
 * OpenRouter Adapter
 *
 * Adapter that wraps the existing OpenRouterClient to implement the AIProvider interface.
 * This allows OpenRouter to be used alongside other providers in the pluggable architecture.
 */

import {
  AIProvider,
  AIResponse,
  AIStreamOptions,
  AIProviderConfig,
  AIProviderError,
  RateLimitError,
  QuotaExceededError,
  AuthenticationError,
} from './ai-provider-interface';
import { OpenRouterClient, OpenRouterConfig } from './openrouter-client';

export class OpenRouterAdapter implements AIProvider {
  constructor(private openRouterClient: OpenRouterClient) {}

  getProviderName(): string {
    return 'openrouter';
  }

  getModel(): string {
    return this.openRouterClient.getConfig().model;
  }

  getConfig(): AIProviderConfig {
    const config = this.openRouterClient.getConfig();
    return {
      model: config.model,
      apiKey: '***', // Hide API key
      maxRetries: 3,
    };
  }

  isAvailable(): boolean {
    // OpenRouter doesn't have built-in rate limiting, so assume always available
    return true;
  }

  getRateLimitStatus() {
    // OpenRouter doesn't provide rate limit info, return defaults
    return {
      requestsRemaining: Infinity,
      resetTime: new Date(Date.now() + 60000), // 1 minute from now
      dailyRequestsRemaining: undefined,
      dailyResetTime: undefined,
    };
  }

  async streamGenerateWithRetry(
    prompt: string,
    options: AIStreamOptions = {},
    retries: number = 0,
    onToken?: (token: string) => void,
  ): Promise<AIResponse> {
    try {
      const openRouterOptions = {
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        topP: options.topP,
        stop: options.stopSequences,
      };

      const response = await this.openRouterClient.streamGenerateWithRetry(
        prompt,
        openRouterOptions,
        retries,
        onToken,
      );

      return {
        content: response.content,
        model: response.model,
        usage: {
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
        },
        finishReason: response.finishReason,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generate(prompt: string, options: AIStreamOptions = {}): Promise<AIResponse> {
    return this.streamGenerateWithRetry(prompt, options, 0);
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.openRouterClient.testConnection();
      return result.success;
    } catch (error) {
      return false;
    }
  }

  private handleError(error: unknown): AIProviderError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return new RateLimitError('openrouter', 60000);
    }

    if (errorMessage.includes('quota') || errorMessage.includes('QUOTA_EXCEEDED')) {
      return new QuotaExceededError('openrouter');
    }

    if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
      return new AuthenticationError('openrouter');
    }

    return new AIProviderError(
      `OpenRouter error: ${errorMessage}`,
      'PROVIDER_ERROR',
      'openrouter',
      true,
    );
  }
}

/**
 * Create OpenRouter adapter from existing client
 */
export function createOpenRouterAdapter(client: OpenRouterClient): OpenRouterAdapter {
  return new OpenRouterAdapter(client);
}

/**
 * Create OpenRouter adapter with new client
 */
export function createOpenRouterAdapterFromConfig(config: OpenRouterConfig): OpenRouterAdapter {
  const client = new OpenRouterClient(config);
  return new OpenRouterAdapter(client);
}
