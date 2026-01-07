/**
 * AI Provider Factory
 *
 * Factory for creating and managing different AI providers.
 * Handles provider selection, fallback logic, and configuration.
 */

import {
  AIProvider,
  AIProviderConfig,
  ProviderType,
  ProviderSelection,
  AIProviderFactory,
  AIProviderError,
} from "./ai-provider-interface";
import {
  GeminiClient,
  createCustomGeminiClient,
  GeminiConfig,
} from "./gemini-client";
import {
  OpenRouterAdapter,
  createOpenRouterAdapterFromConfig,
} from "./openrouter-adapter";

export interface FactoryConfig {
  gemini?: {
    apiKey?: string;
    model?:
      | "gemini-2.5-pro"
      | "gemini-2.0-flash-exp"
      | "gemini-1.5-pro"
      | "gemini-1.5-flash";
  };
  openrouter?: {
    apiKey?: string;
    model?: string;
  };
  defaultProvider: ProviderType;
  enableFallback: boolean;
}

/**
 * Concrete implementation of AI Provider Factory
 */
export class AIProviderFactoryImpl implements AIProviderFactory {
  private providers = new Map<ProviderType, AIProvider>();
  private config: FactoryConfig;

  constructor(config: FactoryConfig) {
    this.config = config;
  }

  createProvider(type: ProviderType, config: AIProviderConfig): AIProvider {
    switch (type) {
      case "gemini":
        return this.createGeminiProvider(config as GeminiConfig);
      case "openrouter":
        return this.createOpenRouterProvider(config);
      default:
        throw new AIProviderError(
          `Unknown provider type: ${type}`,
          "UNKNOWN_PROVIDER",
          "factory",
          false,
        );
    }
  }

  getAvailableProviders(): ProviderType[] {
    const providers: ProviderType[] = [];

    // Check Gemini
    if (
      this.config.gemini?.apiKey ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY
    ) {
      providers.push("gemini");
    }

    // Check OpenRouter
    if (this.config.openrouter?.apiKey || process.env.OPENROUTER_API_KEY) {
      providers.push("openrouter");
    }

    return providers;
  }

  selectProvider(selection: ProviderSelection): AIProvider {
    const availableProviders = this.getAvailableProviders();

    // Try primary provider
    if (
      selection.primary !== "auto" &&
      availableProviders.includes(selection.primary)
    ) {
      const provider = this.getOrCreateProvider(selection.primary);
      if (provider && provider.isAvailable()) {
        return provider;
      }
    }

    // Try auto-selection
    if (selection.primary === "auto") {
      for (const providerType of this.getProviderPriority()) {
        if (availableProviders.includes(providerType)) {
          const provider = this.getOrCreateProvider(providerType);
          if (provider && provider.isAvailable()) {
            return provider;
          }
        }
      }
    }

    // Try fallback provider
    if (
      selection.autoFallback &&
      selection.fallback &&
      availableProviders.includes(selection.fallback)
    ) {
      const provider = this.getOrCreateProvider(selection.fallback);
      if (provider && provider.isAvailable()) {
        return provider;
      }
    }

    throw new AIProviderError(
      "No available AI providers found",
      "NO_PROVIDERS_AVAILABLE",
      "factory",
      false,
    );
  }

  /**
   * Get current active provider
   */
  getActiveProvider(): AIProvider | null {
    const selection: ProviderSelection = {
      primary: this.config.defaultProvider,
      fallback:
        this.config.defaultProvider === "openrouter" ? "gemini" : "openrouter",
      autoFallback: this.config.enableFallback,
    };

    try {
      return this.selectProvider(selection);
    } catch {
      return null;
    }
  }

  /**
   * Test all available providers
   */
  async testAllProviders(): Promise<Map<ProviderType, boolean>> {
    const results = new Map<ProviderType, boolean>();
    const availableProviders = this.getAvailableProviders();

    for (const providerType of availableProviders) {
      try {
        const provider = this.getOrCreateProvider(providerType);
        if (provider) {
          const isWorking = await provider.testConnection();
          results.set(providerType, isWorking);
        } else {
          results.set(providerType, false);
        }
      } catch (error) {
        console.error(`Failed to test provider ${providerType}:`, error);
        results.set(providerType, false);
      }
    }

    return results;
  }

  /**
   * Get provider status information
   */
  getProviderStatus(): Array<{
    type: ProviderType;
    available: boolean;
    model: string;
    rateLimitStatus?: {
      requestsRemaining: number;
      resetTime: Date;
      dailyRequestsRemaining?: number;
      dailyResetTime?: Date;
    };
  }> {
    const availableProviders = this.getAvailableProviders();
    const status: Array<{
      type: ProviderType;
      available: boolean;
      model: string;
      rateLimitStatus?: {
        requestsRemaining: number;
        resetTime: Date;
        dailyRequestsRemaining?: number;
        dailyResetTime?: Date;
      };
    }> = [];

    for (const providerType of availableProviders) {
      try {
        const provider = this.getOrCreateProvider(providerType);
        if (provider) {
          status.push({
            type: providerType,
            available: provider.isAvailable(),
            model: provider.getModel(),
            rateLimitStatus: provider.getRateLimitStatus(),
          });
        }
      } catch (error) {
        status.push({
          type: providerType,
          available: false,
          model: "unknown",
        });
      }
    }

    return status;
  }

  /**
   * Clear cached providers (useful for reconfiguration)
   */
  clearCache(): void {
    this.providers.clear();
  }

  private createGeminiProvider(config: GeminiConfig): GeminiClient {
    const geminiConfig: GeminiConfig = {
      model: config.model || this.config.gemini?.model || "gemini-2.5-pro",
      apiKey:
        config.apiKey ||
        this.config.gemini?.apiKey ||
        process.env.GOOGLE_API_KEY ||
        process.env.GEMINI_API_KEY ||
        "",
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 2,
    };

    return createCustomGeminiClient(geminiConfig);
  }

  private createOpenRouterProvider(
    config: AIProviderConfig,
  ): OpenRouterAdapter {
    const apiKey =
      config.apiKey ||
      this.config.openrouter?.apiKey ||
      process.env.OPENROUTER_API_KEY ||
      "";
    const model =
      config.model ||
      this.config.openrouter?.model ||
      "google/gemma-3n-e4b-it:free";

    if (!apiKey) {
      throw new AIProviderError(
        "OpenRouter API key not found",
        "MISSING_API_KEY",
        "openrouter",
        false,
      );
    }

    return createOpenRouterAdapterFromConfig({
      apiKey,
      model,
      temperature: 0.1,
    });
  }

  private getOrCreateProvider(type: ProviderType): AIProvider | null {
    // Check cache first
    if (this.providers.has(type)) {
      return this.providers.get(type)!;
    }

    try {
      let provider: AIProvider;

      if (type === "gemini") {
        const geminiKey =
          this.config.gemini?.apiKey ||
          process.env.GOOGLE_API_KEY ||
          process.env.GEMINI_API_KEY;
        if (!geminiKey) return null;

        provider = this.createGeminiProvider({
          model: this.config.gemini?.model || "gemini-2.5-pro",
          apiKey: geminiKey,
          timeout: 30000,
          maxRetries: 2,
        });
      } else if (type === "openrouter") {
        const openrouterKey =
          this.config.openrouter?.apiKey || process.env.OPENROUTER_API_KEY;
        if (!openrouterKey) return null;

        provider = this.createOpenRouterProvider({
          model:
            this.config.openrouter?.model || "openai/gpt-oss-120b:free",
          apiKey: openrouterKey,
        });
      } else {
        return null;
      }

      // Cache the provider
      this.providers.set(type, provider);
      return provider;
    } catch (error) {
      console.error(`Failed to create provider ${type}:`, error);
      return null;
    }
  }

  private getProviderPriority(): ProviderType[] {
    // OpenRouter first (primary provider), then Gemini as fallback
    return ["openrouter", "gemini"];
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create AI provider factory with default configuration
 */
export function createAIProviderFactory(): AIProviderFactoryImpl {
  const config: FactoryConfig = {
    defaultProvider: "openrouter", // Prefer OpenRouter as primary provider
    enableFallback: true,
  };

  return new AIProviderFactoryImpl(config);
}

/**
 * Create AI provider factory with custom configuration
 */
export function createCustomAIProviderFactory(
  config: FactoryConfig,
): AIProviderFactoryImpl {
  return new AIProviderFactoryImpl(config);
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultFactory: AIProviderFactoryImpl | null = null;

export function getAIProviderFactory(): AIProviderFactoryImpl {
  if (!defaultFactory) {
    defaultFactory = createAIProviderFactory();
  }
  return defaultFactory;
}

/**
 * Get the current active AI provider
 * This is the main function other services should use
 */
export function getActiveAIProvider(): AIProvider {
  const factory = getAIProviderFactory();
  const provider = factory.getActiveProvider();

  if (!provider) {
    throw new AIProviderError(
      "No AI providers available. Check your API keys and configuration.",
      "NO_PROVIDERS_AVAILABLE",
      "factory",
      false,
    );
  }

  return provider;
}
