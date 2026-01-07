import { z } from 'zod';

/**
 * Generation Contract Model
 *
 * Defines the preconditions, requirements, and validations that must be
 * satisfied for the Zero-to-One Code Generation Pipeline.
 *
 * This contract is enforced BEFORE any code generation begins and
 * AFTER generation completes to ensure architectural integrity.
 */

// ============================================================================
// Preconditions Schema - Must ALL be true before generation starts
// ============================================================================

export const PreconditionsSchema = z.object({
  // Mode must be ZERO_TO_ONE (not yet transitioned to ONE_TO_N)
  mode_is_zero_to_one: z.boolean(),

  // Intent classification must be CREATION (not DISCUSSION, PLANNING, or INVALID)
  intent_is_creation: z.boolean(),

  // Project Identity must exist and be immutable
  project_identity_exists: z.boolean(),

  // Architecture Plan must exist
  architecture_plan_exists: z.boolean(),

  // No artifacts should exist yet (first generation)
  no_artifacts_exist: z.boolean(),
});

export type Preconditions = z.infer<typeof PreconditionsSchema>;

// ============================================================================
// Generation Requirements Schema - Rules during generation
// ============================================================================

export const GenerationRequirementsSchema = z.object({
  // Output must be complete - no partial files
  must_be_complete: z.boolean(),

  // No TODOs, stubs, or placeholder comments allowed
  no_todos_or_stubs: z.boolean(),

  // All code must follow single architectural philosophy
  single_architecture_philosophy: z.boolean(),

  // Code must align with Project Identity constraints
  align_with_identity: z.boolean(),

  // Code must follow Architecture Plan rules exactly
  align_with_architecture: z.boolean(),

  // No features beyond what was requested
  no_speculative_features: z.boolean(),
});

export type GenerationRequirements = z.infer<typeof GenerationRequirementsSchema>;

// ============================================================================
// Post-Generation Validations Schema
// ============================================================================

export const PostGenerationValidationsSchema = z.object({
  // Dart code must be syntactically valid
  syntax_valid: z.boolean(),

  // lib/main.dart entry point must exist
  entry_point_exists: z.boolean(),

  // Core functionality must be implemented (not empty widgets)
  core_functionality_implemented: z.boolean(),

  // All names must follow established conventions
  naming_conventions_followed: z.boolean(),

  // No unused imports, classes, or variables
  no_unused_structures: z.boolean(),
});

export type PostGenerationValidations = z.infer<typeof PostGenerationValidationsSchema>;

// ============================================================================
// Complete Generation Contract
// ============================================================================

export const GenerationContractSchema = z.object({
  preconditions: PreconditionsSchema,
  requirements: GenerationRequirementsSchema,
  validations: PostGenerationValidationsSchema,
});

export type GenerationContract = z.infer<typeof GenerationContractSchema>;

// ============================================================================
// Contract Validation Result
// ============================================================================

export interface ContractValidationResult {
  valid: boolean;
  phase: 'preconditions' | 'requirements' | 'validations';
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates an empty preconditions object (all false)
 */
export function createEmptyPreconditions(): Preconditions {
  return {
    mode_is_zero_to_one: false,
    intent_is_creation: false,
    project_identity_exists: false,
    architecture_plan_exists: false,
    no_artifacts_exist: false,
  };
}

/**
 * Creates default generation requirements (all true - strictest mode)
 */
export function createDefaultRequirements(): GenerationRequirements {
  return {
    must_be_complete: true,
    no_todos_or_stubs: true,
    single_architecture_philosophy: true,
    align_with_identity: true,
    align_with_architecture: true,
    no_speculative_features: true,
  };
}

/**
 * Creates empty post-generation validations (all false, to be filled after validation)
 */
export function createEmptyValidations(): PostGenerationValidations {
  return {
    syntax_valid: false,
    entry_point_exists: false,
    core_functionality_implemented: false,
    naming_conventions_followed: false,
    no_unused_structures: false,
  };
}

/**
 * Creates a complete generation contract with defaults
 */
export function createGenerationContract(): GenerationContract {
  return {
    preconditions: createEmptyPreconditions(),
    requirements: createDefaultRequirements(),
    validations: createEmptyValidations(),
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates that all preconditions are met
 */
export function validatePreconditions(preconditions: Preconditions): ContractValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!preconditions.mode_is_zero_to_one) {
    errors.push('Project is not in ZERO_TO_ONE mode. Cannot generate initial artifacts.');
  }

  if (!preconditions.intent_is_creation) {
    errors.push('Intent is not CREATION. Use CREATION intent for code generation.');
  }

  if (!preconditions.project_identity_exists) {
    errors.push('Project Identity does not exist. Create identity before generating code.');
  }

  if (!preconditions.architecture_plan_exists) {
    errors.push('Architecture Plan does not exist. Create architecture plan before generating code.');
  }

  if (!preconditions.no_artifacts_exist) {
    errors.push('Artifacts already exist. Zero-to-One generation only allowed for new projects.');
  }

  return {
    valid: errors.length === 0,
    phase: 'preconditions',
    errors,
    warnings,
  };
}

/**
 * Validates post-generation output
 */
export function validatePostGeneration(validations: PostGenerationValidations): ContractValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!validations.syntax_valid) {
    errors.push('Generated code has syntax errors.');
  }

  if (!validations.entry_point_exists) {
    errors.push('Entry point (lib/main.dart) is missing.');
  }

  if (!validations.core_functionality_implemented) {
    warnings.push('Core functionality may not be fully implemented.');
  }

  if (!validations.naming_conventions_followed) {
    warnings.push('Some naming conventions may not be followed.');
  }

  if (!validations.no_unused_structures) {
    warnings.push('Some unused structures detected.');
  }

  return {
    valid: errors.length === 0,
    phase: 'validations',
    errors,
    warnings,
  };
}
