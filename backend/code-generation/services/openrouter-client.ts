/**
 * OpenRouter API Client
 *
 * Provides both streaming and non-streaming interfaces to the OpenRouter API
 * for code generation using various LLM models.
 *
 * Features:
 * - Streaming support via async generators
 * - Automatic retry with exponential backoff
 * - Token usage tracking
 * - Error handling and recovery
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature: number;
  siteUrl?: string;
  siteName?: string;
}

export interface OpenRouterRequestOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

// ============================================================================
// API Types
// ============================================================================

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface OpenRouterChoice {
  index: number;
  message?: {
    role: string;
    content: string;
  };
  delta?: {
    role?: string;
    content?: string;
  };
  finish_reason: string | null;
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: OpenRouterChoice[];
  usage?: OpenRouterUsage;
  created: number;
}

export interface OpenRouterStreamChunk {
  id: string;
  model: string;
  choices: OpenRouterChoice[];
  created: number;
}

// ============================================================================
// Response Types
// ============================================================================

export interface GenerateResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  finishReason?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

// ============================================================================
// OpenRouter Client Class
// ============================================================================

export class OpenRouterClient {
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private readonly config: OpenRouterConfig;

  constructor(config: Partial<OpenRouterConfig> = {}) {
    // Load from environment variables with fallbacks
    this.config = {
      apiKey: config.apiKey || process.env.OPENROUTER_API_KEY || '',
      model: config.model || process.env.OPENROUTER_MODEL || 'google/gemma-3n-e4b-it:free',
      maxTokens: config.maxTokens || 8000,
      temperature: config.temperature ?? 0.2,
      siteUrl: config.siteUrl || process.env.OPENROUTER_SITE_URL || 'https://flutter-ui-generator.app',
      siteName: config.siteName || process.env.OPENROUTER_SITE_NAME || 'Flutter UI Generator',
    };

    if (!this.config.apiKey) {
      console.warn('⚠️ OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable.');
    }
  }

  /**
   * Get current configuration (without exposing API key)
   */
  getConfig(): Omit<OpenRouterConfig, 'apiKey'> & { hasApiKey: boolean } {
    return {
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      siteUrl: this.config.siteUrl,
      siteName: this.config.siteName,
      hasApiKey: !!this.config.apiKey,
    };
  }

  /**
   * Non-streaming generation - returns complete response
   */
  async generate(
    prompt: string,
    options: OpenRouterRequestOptions = {}
  ): Promise<GenerateResponse> {
    if (!this.config.apiKey) {
      throw new OpenRouterError('OpenRouter API key not configured', undefined, 'NO_API_KEY');
    }

    const requestBody: OpenRouterRequest = {
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? this.config.temperature,
      stream: false,
    };

    // Only add max_tokens if explicitly provided
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    } else if (this.config.maxTokens !== undefined) {
      requestBody.max_tokens = this.config.maxTokens;
    }

    if (options.topP !== undefined) requestBody.top_p = options.topP;
    if (options.frequencyPenalty !== undefined) requestBody.frequency_penalty = options.frequencyPenalty;
    if (options.presencePenalty !== undefined) requestBody.presence_penalty = options.presencePenalty;
    if (options.stop) requestBody.stop = options.stop;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const data = await response.json() as OpenRouterResponse;

    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: data.model,
      finishReason: data.choices[0]?.finish_reason || 'unknown',
    };
  }

  /**
   * Streaming generation - yields chunks as they arrive
   */
  async *streamGenerate(
    prompt: string,
    options: OpenRouterRequestOptions = {}
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.config.apiKey) {
      throw new OpenRouterError('OpenRouter API key not configured', undefined, 'NO_API_KEY');
    }

    const requestBody: OpenRouterRequest = {
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? this.config.temperature,
      stream: true,
    };

    // Only add max_tokens if explicitly provided
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    } else if (this.config.maxTokens !== undefined) {
      requestBody.max_tokens = this.config.maxTokens;
    }

    if (options.topP !== undefined) requestBody.top_p = options.topP;
    if (options.frequencyPenalty !== undefined) requestBody.frequency_penalty = options.frequencyPenalty;
    if (options.presencePenalty !== undefined) requestBody.presence_penalty = options.presencePenalty;
    if (options.stop) requestBody.stop = options.stop;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    if (!response.body) {
      throw new OpenRouterError('Response body is empty', undefined, 'EMPTY_RESPONSE');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            const chunk = this.parseStreamChunk(buffer);
            if (chunk) yield chunk;
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (!trimmedLine || trimmedLine.startsWith(':')) {
            // Empty line or comment, skip
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6); // Remove "data: " prefix

            if (data === '[DONE]') {
              yield { content: '', done: true, finishReason: 'stop' };
              return;
            }

            try {
              const parsed: OpenRouterStreamChunk = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              const finishReason = parsed.choices[0]?.finish_reason;

              yield {
                content,
                done: !!finishReason,
                finishReason: finishReason || undefined,
              };
            } catch (parseError) {
              // Skip unparseable chunks (might be partial JSON)
              console.warn('Failed to parse stream chunk:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Streaming generation with automatic retry
   * Collects all content and provides final usage stats
   */
  async streamGenerateWithRetry(
    prompt: string,
    options: OpenRouterRequestOptions = {},
    maxRetries: number = 2,
    onChunk?: (content: string) => void,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<GenerateResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        let fullContent = '';
        let finishReason = 'unknown';

        const stream = this.streamGenerate(prompt, options);

        for await (const chunk of stream) {
          fullContent += chunk.content;
          if (chunk.finishReason) {
            finishReason = chunk.finishReason;
          }
          if (onChunk && chunk.content) {
            onChunk(chunk.content);
          }
        }

        // Estimate token counts (rough approximation)
        const promptTokens = Math.ceil(prompt.length / 4);
        const completionTokens = Math.ceil(fullContent.length / 4);

        return {
          content: fullContent,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
          },
          model: this.config.model,
          finishReason,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt <= maxRetries) {
          if (onRetry) {
            onRetry(attempt, lastError);
          }

          // Exponential backoff: 1s, 2s, 4s...
          const delay = Math.pow(2, attempt - 1) * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new OpenRouterError('Generation failed after all retries');
  }

  /**
   * Generate with messages array (for multi-turn conversations)
   */
  async generateWithMessages(
    messages: OpenRouterMessage[],
    options: OpenRouterRequestOptions = {}
  ): Promise<GenerateResponse> {
    if (!this.config.apiKey) {
      throw new OpenRouterError('OpenRouter API key not configured', undefined, 'NO_API_KEY');
    }

    const requestBody: OpenRouterRequest = {
      model: this.config.model,
      messages,
      temperature: options.temperature ?? this.config.temperature,
      stream: false,
    };

    // Only add max_tokens if explicitly provided
    if (options.maxTokens !== undefined) {
      requestBody.max_tokens = options.maxTokens;
    } else if (this.config.maxTokens !== undefined) {
      requestBody.max_tokens = this.config.maxTokens;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const data = await response.json() as OpenRouterResponse;

    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: data.model,
      finishReason: data.choices[0]?.finish_reason || 'unknown',
    };
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<{ success: boolean; message: string; model?: string }> {
    try {
      const response = await this.generate('Say "OK" and nothing else.', {
        temperature: 0,
      });

      return {
        success: true,
        message: `Connected successfully. Response: ${response.content.substring(0, 50)}`,
        model: response.model,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Connection failed: ${message}`,
      };
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private buildHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.config.siteUrl || '',
      'X-Title': this.config.siteName || '',
    };
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
    let errorCode: string | undefined;
    let retryable = false;

    try {
      const errorBody = await response.json();
      if (errorBody && typeof errorBody === 'object' && 'error' in errorBody) {
        const error = errorBody.error as any;
        errorMessage = error.message || errorMessage;
        errorCode = error.code;
      }
    } catch {
      // Could not parse error body, use default message
    }

    // Determine if error is retryable
    if (response.status === 429) {
      retryable = true;
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (response.status >= 500) {
      retryable = true;
    }

    throw new OpenRouterError(errorMessage, response.status, errorCode, retryable);
  }

  private parseStreamChunk(line: string): StreamChunk | null {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data: ')) return null;

    const data = trimmed.slice(6);
    if (data === '[DONE]') {
      return { content: '', done: true, finishReason: 'stop' };
    }

    try {
      const parsed: OpenRouterStreamChunk = JSON.parse(data);
      return {
        content: parsed.choices[0]?.delta?.content || '',
        done: !!parsed.choices[0]?.finish_reason,
        finishReason: parsed.choices[0]?.finish_reason || undefined,
      };
    } catch {
      return null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Default Export - Singleton Instance
// ============================================================================

let defaultClient: OpenRouterClient | null = null;

/**
 * Get the default OpenRouter client instance
 */
export function getOpenRouterClient(): OpenRouterClient {
  if (!defaultClient) {
    defaultClient = new OpenRouterClient();
  }
  return defaultClient;
}

/**
 * Create a new OpenRouter client with custom configuration
 */
export function createOpenRouterClient(config: Partial<OpenRouterConfig>): OpenRouterClient {
  return new OpenRouterClient(config);
}
