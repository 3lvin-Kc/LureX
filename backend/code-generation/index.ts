/**
 * Code Generation Module
 *
 * Zero-to-One Code Generation Pipeline for Flutter UI applications.
 *
 * This module provides the complete infrastructure for generating Flutter
 * code from user prompts, constrained by Project Identity and Architecture Plan.
 *
 * Main Components:
 * - CodeGeneratorService: Main orchestrator for the generation pipeline
 * - AIProvider: Pluggable AI provider interface (Gemini, OpenRouter)
 * - GeminiClient: Google Gemini AI with rate limiting
 * - PromptAssembler: Builds prompts from identity + architecture
 * - ResponseParser: Parses and validates AI-generated code
 * - StorageService: Uploads files to Supabase Storage
 * - ArtifactRepository: Manages generated artifact metadata
 *
 * Usage:
 * ```typescript
 * import { getCodeGeneratorService } from './code-generation';
 *
 * const generator = getCodeGeneratorService();
 * const result = await generator.executeZeroToOnePipeline({
 *   project_state_id: 'uuid',
 *   user_prompt: 'Build a todo app',
 * });
 * ```
 */

// =============================================================================
// Models
// =============================================================================

export {
  // Generation Contract
  PreconditionsSchema,
  GenerationRequirementsSchema,
  PostGenerationValidationsSchema,
  GenerationContractSchema,
  type Preconditions,
  type GenerationRequirements,
  type PostGenerationValidations,
  type GenerationContract,
  type ContractValidationResult,
  createEmptyPreconditions,
  createDefaultRequirements,
  createEmptyValidations,
  createGenerationContract,
  validatePreconditions,
  validatePostGeneration,

  // Generated Artifact
  FileTypeEnum,
  GeneratedArtifactSchema,
  GeneratedArtifactInputSchema,
  type FileType,
  type GeneratedArtifact,
  type GeneratedArtifactInput,
  type ParsedFile,
  type GeneratedArtifactRow,
  extractFileName,
  determineFileType,
  isEntryPointFile,
  generateStoragePath,
  createArtifactInput,
  mapRowToArtifact,

  // Generation Result
  GenerationStatusEnum,
  GenerationMetadataSchema,
  ValidationErrorSchema,
  GenerationResultSchema,
  GenerationSessionSchema,
  GenerationSessionInputSchema,
  type GenerationStatus,
  type GenerationMetadata,
  type ValidationError,
  type GenerationResult,
  type GenerationSession,
  type GenerationSessionInput,
  type GenerationSessionRow,
  type StreamEventType,
  type StreamEvent,
  type StatusEvent,
  type TokenEvent,
  type FileStartEvent,
  type FileCompleteEvent,
  type FileUploadedEvent,
  type ValidationEvent,
  type ErrorEvent,
  type RetryEvent,
  type CompleteEvent,
  createInitialResult,
  createFailedResult,
  createSuccessResult,
  createValidationError,
  createStreamEvent,
  mapRowToSession,
} from "./models";

// =============================================================================
// Services
// =============================================================================

export {
  // OpenRouter Client
  OpenRouterClient,
  OpenRouterError,
  getOpenRouterClient,
  createOpenRouterClient,
  type OpenRouterConfig,
  type OpenRouterRequestOptions,
  type OpenRouterMessage,
  type GenerateResponse,
  type StreamChunk,

  // Prompt Assembler
  PromptAssembler,
  getPromptAssembler,
  createPromptAssembler,
  estimateTokenCount,
  truncatePromptIfNeeded,

  // Response Parser
  ResponseParser,
  getResponseParser,
  createResponseParser,
  type ParsedResponse,
  type ValidationResult,

  // Storage Service
  StorageService,
  getStorageService,
  createStorageService,
  type UploadResult,
  type BatchUploadResult,
  type FileContent,

  // Code Generator Service
  CodeGeneratorService,
  getCodeGeneratorService,
  createCodeGeneratorService,
  type GenerationContext,
  type GenerationCallbacks,
  type PreconditionCheckResult,
} from "./services";

// =============================================================================
// Repositories
// =============================================================================

export {
  ArtifactRepository,
  getArtifactRepository,
  createArtifactRepository,
} from "./repositories/artifact-repository";

// =============================================================================
// Convenience Functions
// =============================================================================

import { getCodeGeneratorService } from "./services";
import { GenerationSessionInput, GenerationResult } from "./models";
import { GenerationCallbacks } from "./services";

/**
 * Execute the Zero-to-One code generation pipeline
 *
 * This is the main entry point for generating Flutter code from a user prompt.
 * It handles the complete flow:
 * 1. Validates preconditions (mode, artifacts)
 * 2. Creates Project Identity if needed
 * 3. Generates Architecture Plan if needed
 * 4. Generates code via AI provider (Gemini/OpenRouter)
 * 5. Validates and uploads files
 * 6. Locks mode to ONE_TO_N
 *
 * @param input - Generation session input (project_state_id, user_prompt)
 * @param callbacks - Optional callbacks for progress updates
 * @returns Generation result with artifacts or errors
 */
export async function executeZeroToOneGeneration(
  input: GenerationSessionInput,
  callbacks?: GenerationCallbacks,
): Promise<GenerationResult> {
  const service = getCodeGeneratorService();
  return service.executeZeroToOnePipeline(input, callbacks);
}

/**
 * Test AI Provider connectivity
 */
export async function testAIProviderConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  const service = getCodeGeneratorService();
  return service.testAIProviderConnection();
}

/**
 * Get code generation configuration
 */
export function getGenerationConfig(): {
  provider: string;
  model: string;
  maxRetries: number;
  storageBucket: string;
  rateLimitStatus?: {
    requestsRemaining: number;
    resetTime: Date;
    dailyRequestsRemaining?: number;
    dailyResetTime?: Date;
  };
} {
  const service = getCodeGeneratorService();
  return service.getConfiguration();
}
