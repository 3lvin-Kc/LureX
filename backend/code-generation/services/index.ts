/**
 * Code Generation Services
 *
 * This module exports all services used by the Zero-to-One Code Generation Pipeline.
 */

// Base Structure Template - Single source of truth for project structure
export {
  MANDATORY_FILES,
  ALL_MANDATORY_FILES,
  FOLDER_CONVENTIONS,
  DELIMITERS,
  getOutputFormatInstructions,
  getPubspecTemplate,
  getMandatoryStructurePrompt,
  getArchitecturePrinciplesPrompt,
  getDesignSystemPrompt,
  getCodeQualityPrompt,
  getFileStrategyPrompt,
  isValidScreenPath,
  isValidWidgetPath,
  isMandatoryFile,
  isValidFilePath,
  getFileType,
  getMissingMandatoryFiles,
  validateFileLocations,
} from "./base-structure-template";

// Scaffold Injector - Injects and manages base project scaffold
export {
  ScaffoldInjector,
  getScaffoldInjector,
  createScaffoldInjector,
  deriveAppName,
  deriveAppTitle,
  ROUTER_MARKERS,
  type ScaffoldFile,
  type RouterAdditions,
  type GeneratedScaffold,
} from "./scaffold-injector";

// OpenRouter Client - AI API communication
export {
  OpenRouterClient,
  OpenRouterError,
  getOpenRouterClient,
  createOpenRouterClient,
  type OpenRouterConfig,
  type OpenRouterRequestOptions,
  type OpenRouterMessage,
  type GenerateResponse,
  type StreamChunk,
} from "./openrouter-client";

// Prompt Assembler - Builds AI prompts from identity and architecture
export {
  PromptAssembler,
  getPromptAssembler,
  createPromptAssembler,
  estimateTokenCount,
  truncatePromptIfNeeded,
} from "./prompt-assembler";

// Response Parser - Parses and validates AI-generated code
export {
  ResponseParser,
  getResponseParser,
  createResponseParser,
  type ParsedResponse,
  type ValidationResult,
} from "./response-parser";

// Storage Service - Uploads files to Supabase Storage
export {
  StorageService,
  getStorageService,
  createStorageService,
  type UploadResult,
  type BatchUploadResult,
  type FileContent,
} from "./storage-service";

// Code Generator Service - Main orchestrator
export {
  CodeGeneratorService,
  getCodeGeneratorService,
  createCodeGeneratorService,
  type GenerationContext,
  type GenerationCallbacks,
  type PreconditionCheckResult,
} from "./code-generator-service";
