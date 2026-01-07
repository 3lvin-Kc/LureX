import { z } from "zod";
import {
  GeneratedArtifact,
  GeneratedArtifactSchema,
  ParsedFile,
} from "./generated-artifact";

/**
 * Generation Result Model
 *
 * Represents the complete output of the Zero-to-One Code Generation Pipeline.
 * Includes generated artifacts, validation status, and metadata about the generation process.
 */

// ============================================================================
// Generation Status Enum
// ============================================================================

export const GenerationStatusEnum = z.enum([
  "pending", // Generation not yet started
  "generating", // AI is generating code
  "validating", // Validating generated code
  "uploading", // Uploading files to storage
  "completed", // Successfully completed
  "failed", // Generation failed
  "retrying", // Retrying after failure
]);

export type GenerationStatus = z.infer<typeof GenerationStatusEnum>;

// ============================================================================
// Generation Metadata Schema
// ============================================================================

export const GenerationMetadataSchema = z.object({
  // AI model information
  model_used: z.string(),
  tokens_prompt: z.number().int().nonnegative(),
  tokens_completion: z.number().int().nonnegative(),
  tokens_total: z.number().int().nonnegative(),

  // Timing information
  generation_time_ms: z.number().int().nonnegative(),
  validation_time_ms: z.number().int().nonnegative().optional(),
  upload_time_ms: z.number().int().nonnegative().optional(),
  total_time_ms: z.number().int().nonnegative(),

  // Attempt tracking
  attempt_number: z.number().int().positive(),
  max_attempts: z.number().int().positive(),
});

export type GenerationMetadata = z.infer<typeof GenerationMetadataSchema>;

// ============================================================================
// Validation Error Schema
// ============================================================================

export const ValidationErrorSchema = z.object({
  type: z.enum([
    "syntax",
    "missing_entry_point",
    "naming_convention",
    "incomplete",
    "parse_error",
    "unknown",
    // New validation types for strict file location enforcement
    "invalid_file_location",
    "missing_mandatory_file",
    "missing_screen",
    "file_location_warning",
    // Import validation types
    "missing_router",
    "missing_import_target",
    "missing_widget",
    "screen_import_screen",
    "forbidden_import",
    "missing_router_import",
    "missing_route_cases",
    "missing_class",
    // Category validation
    "unsupported_category",
  ]),
  message: z.string(),
  file_path: z.string().optional(),
  line_number: z.number().int().positive().optional(),
  severity: z.enum(["error", "warning"]),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

// ============================================================================
// Generation Result Schema
// ============================================================================

export const GenerationResultSchema = z.object({
  // Overall status
  success: z.boolean(),
  status: GenerationStatusEnum,

  // Contract fulfillment
  contract_fulfilled: z.boolean(),
  preconditions_met: z.boolean(),
  validations_passed: z.boolean(),

  // Generated artifacts (metadata only, content in storage)
  artifacts: z.array(GeneratedArtifactSchema),
  files_count: z.number().int().nonnegative(),

  // Errors and warnings
  validation_errors: z.array(ValidationErrorSchema),

  // Metadata about the generation process
  metadata: GenerationMetadataSchema,

  // Session tracking
  session_id: z.string().uuid().optional(),
});

export type GenerationResult = z.infer<typeof GenerationResultSchema>;

// ============================================================================
// Streaming Event Types (for SSE)
// ============================================================================

export type StreamEventType =
  | "status" // Status update (phase change)
  | "token" // Individual token from AI
  | "file_start" // New file being generated
  | "file_complete" // File generation complete
  | "file_uploaded" // File uploaded to storage
  | "validation" // Validation result
  | "error" // Error occurred
  | "retry" // Retrying generation
  | "complete"; // Generation complete

export interface StreamEvent {
  type: StreamEventType;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface StatusEvent extends StreamEvent {
  type: "status";
  data: {
    phase:
      | "preparing"
      | "creating_identity"
      | "creating_architecture"
      | "generating"
      | "validating"
      | "uploading"
      | "finalizing";
    message: string;
    progress?: number; // 0-100
  };
}

export interface TokenEvent extends StreamEvent {
  type: "token";
  data: {
    content: string;
    accumulated_length: number;
  };
}

export interface FileStartEvent extends StreamEvent {
  type: "file_start";
  data: {
    file_path: string;
    file_index: number;
    total_files: number;
  };
}

export interface FileCompleteEvent extends StreamEvent {
  type: "file_complete";
  data: {
    file_path: string;
    file_size_bytes: number;
  };
}

export interface FileUploadedEvent extends StreamEvent {
  type: "file_uploaded";
  data: {
    file_path: string;
    storage_path: string;
  };
}

export interface ValidationEvent extends StreamEvent {
  type: "validation";
  data: {
    passed: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
  };
}

export interface ErrorEvent extends StreamEvent {
  type: "error";
  data: {
    message: string;
    code?: string;
    retrying: boolean;
    attempt_number: number;
    max_attempts: number;
  };
}

export interface RetryEvent extends StreamEvent {
  type: "retry";
  data: {
    attempt_number: number;
    max_attempts: number;
    reason: string;
    delay_ms: number;
  };
}

export interface CompleteEvent extends StreamEvent {
  type: "complete";
  data: {
    success: boolean;
    files_count: number;
    artifacts: GeneratedArtifact[];
    generation_time_ms: number;
    session_id?: string;
  };
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates an initial (empty) generation result
 */
export function createInitialResult(
  sessionId?: string,
): Partial<GenerationResult> {
  return {
    success: false,
    status: "pending",
    contract_fulfilled: false,
    preconditions_met: false,
    validations_passed: false,
    artifacts: [],
    files_count: 0,
    validation_errors: [],
    session_id: sessionId,
  };
}

/**
 * Creates a failed generation result
 */
export function createFailedResult(
  errors: ValidationError[],
  metadata: Partial<GenerationMetadata>,
  sessionId?: string,
): GenerationResult {
  return {
    success: false,
    status: "failed",
    contract_fulfilled: false,
    preconditions_met: false,
    validations_passed: false,
    artifacts: [],
    files_count: 0,
    validation_errors: errors,
    metadata: {
      model_used: metadata.model_used || "unknown",
      tokens_prompt: metadata.tokens_prompt || 0,
      tokens_completion: metadata.tokens_completion || 0,
      tokens_total: metadata.tokens_total || 0,
      generation_time_ms: metadata.generation_time_ms || 0,
      total_time_ms: metadata.total_time_ms || 0,
      attempt_number: metadata.attempt_number || 1,
      max_attempts: metadata.max_attempts || 3,
    },
    session_id: sessionId,
  };
}

/**
 * Creates a successful generation result
 */
export function createSuccessResult(
  artifacts: GeneratedArtifact[],
  metadata: GenerationMetadata,
  sessionId?: string,
): GenerationResult {
  return {
    success: true,
    status: "completed",
    contract_fulfilled: true,
    preconditions_met: true,
    validations_passed: true,
    artifacts,
    files_count: artifacts.length,
    validation_errors: [],
    metadata,
    session_id: sessionId,
  };
}

/**
 * Creates a validation error object
 */
export function createValidationError(
  type: ValidationError["type"],
  message: string,
  severity: ValidationError["severity"] = "error",
  filePath?: string,
  lineNumber?: number,
): ValidationError {
  return {
    type,
    message,
    severity,
    file_path: filePath,
    line_number: lineNumber,
  };
}

/**
 * Creates a stream event with timestamp
 */
export function createStreamEvent<T extends StreamEventType>(
  type: T,
  data: Record<string, unknown>,
): StreamEvent {
  return {
    type,
    timestamp: Date.now(),
    data,
  };
}

// ============================================================================
// Generation Session Schema (for database persistence)
// ============================================================================

export const GenerationSessionSchema = z.object({
  id: z.string().uuid(),
  project_state_id: z.string().uuid(),
  identity_id: z.string().uuid().nullable(),
  architecture_plan_id: z.string().uuid().nullable(),

  user_prompt: z.string(),

  status: GenerationStatusEnum,
  attempt_number: z.number().int().positive(),
  max_attempts: z.number().int().positive(),

  model_used: z.string().nullable(),
  tokens_prompt: z.number().int().nullable(),
  tokens_completion: z.number().int().nullable(),
  tokens_total: z.number().int().nullable(),

  started_at: z.date(),
  completed_at: z.date().nullable(),
  generation_time_ms: z.number().int().nullable(),

  error_message: z.string().nullable(),
  error_details: z.record(z.unknown()).nullable(),

  files_generated: z.number().int().nonnegative(),

  created_at: z.date(),
  updated_at: z.date(),
});

export type GenerationSession = z.infer<typeof GenerationSessionSchema>;

// ============================================================================
// Session Input Schema
// ============================================================================

export const GenerationSessionInputSchema = z.object({
  project_state_id: z.string().uuid(),
  user_prompt: z.string().min(1),
  max_attempts: z.number().int().positive().default(3),
});

export type GenerationSessionInput = z.infer<
  typeof GenerationSessionInputSchema
>;

// ============================================================================
// Database Row Interface
// ============================================================================

export interface GenerationSessionRow {
  id: string;
  project_state_id: string;
  identity_id: string | null;
  architecture_plan_id: string | null;
  user_prompt: string;
  status: string;
  attempt_number: number;
  max_attempts: number;
  model_used: string | null;
  tokens_prompt: number | null;
  tokens_completion: number | null;
  tokens_total: number | null;
  started_at: string;
  completed_at: string | null;
  generation_time_ms: number | null;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  files_generated: number;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a database row to a GenerationSession object
 */
export function mapRowToSession(row: GenerationSessionRow): GenerationSession {
  return {
    id: row.id,
    project_state_id: row.project_state_id,
    identity_id: row.identity_id,
    architecture_plan_id: row.architecture_plan_id,
    user_prompt: row.user_prompt,
    status: row.status as GenerationStatus,
    attempt_number: row.attempt_number,
    max_attempts: row.max_attempts,
    model_used: row.model_used,
    tokens_prompt: row.tokens_prompt,
    tokens_completion: row.tokens_completion,
    tokens_total: row.tokens_total,
    started_at: new Date(row.started_at),
    completed_at: row.completed_at ? new Date(row.completed_at) : null,
    generation_time_ms: row.generation_time_ms,
    error_message: row.error_message,
    error_details: row.error_details,
    files_generated: row.files_generated,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}
