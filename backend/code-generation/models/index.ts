/**
 * Code Generation Models
 *
 * This module exports all models used by the Zero-to-One Code Generation Pipeline.
 */

// Generation Contract - Preconditions, requirements, and validations
export {
  // Schemas
  PreconditionsSchema,
  GenerationRequirementsSchema,
  PostGenerationValidationsSchema,
  GenerationContractSchema,

  // Types
  type Preconditions,
  type GenerationRequirements,
  type PostGenerationValidations,
  type GenerationContract,
  type ContractValidationResult,

  // Factory functions
  createEmptyPreconditions,
  createDefaultRequirements,
  createEmptyValidations,
  createGenerationContract,

  // Validation helpers
  validatePreconditions,
  validatePostGeneration,
} from './generation-contract';

// Generated Artifact - File metadata model
export {
  // Schemas
  FileTypeEnum,
  GeneratedArtifactSchema,
  GeneratedArtifactInputSchema,

  // Types
  type FileType,
  type GeneratedArtifact,
  type GeneratedArtifactInput,
  type ParsedFile,
  type GeneratedArtifactRow,

  // Helper functions
  extractFileName,
  determineFileType,
  isEntryPointFile,
  generateStoragePath,
  createArtifactInput,
  mapRowToArtifact,
} from './generated-artifact';

// Generation Result - Pipeline output model
export {
  // Schemas
  GenerationStatusEnum,
  GenerationMetadataSchema,
  ValidationErrorSchema,
  GenerationResultSchema,
  GenerationSessionSchema,
  GenerationSessionInputSchema,

  // Types
  type GenerationStatus,
  type GenerationMetadata,
  type ValidationError,
  type GenerationResult,
  type GenerationSession,
  type GenerationSessionInput,
  type GenerationSessionRow,

  // Stream event types
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

  // Factory functions
  createInitialResult,
  createFailedResult,
  createSuccessResult,
  createValidationError,
  createStreamEvent,
  mapRowToSession,
} from './generation-result';

