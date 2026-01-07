/**
 * AI Provider Interface
 *
 * Abstract interface for AI providers to enable pluggable architecture.
 * This allows switching between different AI services (OpenRouter, Gemini, etc.)
 * without changing the core code generation logic.
 */

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface AIStreamOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface AIProviderConfig {
  model: string;
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Main AI Provider Interface
 * All AI clients (OpenRouter, Gemini, etc.) must implement this interface
 */
export interface AIProvider {
  /**
   * Get the provider name for logging/debugging
   */
  getProviderName(): string;

  /**
   * Get the current model being used
   */
  getModel(): string;

  /**
   * Get provider configuration
   */
  getConfig(): AIProviderConfig;

  /**
   * Generate response with streaming support
   * @param prompt The input prompt
   * @param options Generation options
   * @param retries Number of retries (for internal retry logic)
   * @param onToken Callback for streaming tokens
   * @returns Promise with the complete response
   */
  streamGenerateWithRetry(
    prompt: string,
    options?: AIStreamOptions,
    retries?: number,
    onToken?: (token: string) => void,
  ): Promise<AIResponse>;

  /**
   * Generate response without streaming
   * @param prompt The input prompt
   * @param options Generation options
   * @returns Promise with the complete response
   */
  generate(prompt: string, options?: AIStreamOptions): Promise<AIResponse>;

  /**
   * Test connection to the AI provider
   * @returns Promise that resolves if connection is successful
   */
  testConnection(): Promise<boolean>;

  /**
   * Check if the provider is currently available (not rate limited)
   * @returns boolean indicating availability
   */
  isAvailable(): boolean;

  /**
   * Get current rate limit status
   * @returns Rate limit information
   */
  getRateLimitStatus(): {
    requestsRemaining: number;
    resetTime: Date;
    dailyRequestsRemaining?: number;
    dailyResetTime?: Date;
  };
}

/**
 * Rate Limiting Interface
 * Providers with rate limiting should implement this
 */
export interface RateLimited {
  /**
   * Check if a request can be made without hitting rate limits
   */
  canMakeRequest(): boolean;

  /**
   * Record that a request was made (for rate limiting tracking)
   */
  recordRequest(): void;

  /**
   * Get time until next request is allowed
   * @returns milliseconds until next request, or 0 if immediately available
   */
  getWaitTime(): number;
}

/**
 * Error types that providers can throw
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class RateLimitError extends AIProviderError {
  constructor(
    provider: string,
    public retryAfter: number, // milliseconds
  ) {
    super(
      `Rate limit exceeded for ${provider}. Retry after ${retryAfter}ms`,
      'RATE_LIMIT_EXCEEDED',
      provider,
      true,
    );
    this.name = 'RateLimitError';
  }
}

export class QuotaExceededError extends AIProviderError {
  constructor(provider: string) {
    super(
      `API quota exceeded for ${provider}`,
      'QUOTA_EXCEEDED',
      provider,
      false,
    );
    this.name = 'QuotaExceededError';
  }
}

export class AuthenticationError extends AIProviderError {
  constructor(provider: string) {
    super(
      `Authentication failed for ${provider}`,
      'AUTHENTICATION_FAILED',
      provider,
      false,
    );
    this.name = 'AuthenticationError';
  }
}

/**
 * Provider Selection Strategy
 */
export type ProviderType = 'gemini' | 'openrouter' | 'auto';

export interface ProviderSelection {
  primary: ProviderType;
  fallback?: ProviderType;
  autoFallback: boolean;
}

/**
 * Factory interface for creating AI providers
 */
export interface AIProviderFactory {
  createProvider(type: ProviderType, config: AIProviderConfig): AIProvider;
  getAvailableProviders(): ProviderType[];
  selectProvider(selection: ProviderSelection): AIProvider;
}
