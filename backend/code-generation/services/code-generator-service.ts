/**
 * Code Generator Service
 *
 * Main orchestrator for the Zero-to-One Code Generation Pipeline.
 *
 * SCAFFOLD-BASED APPROACH:
 * 1. Inject base scaffold files (pubspec.yaml, main.dart, app.dart, app_router.dart)
 * 2. Ask LLM to create only screens and widgets
 * 3. Parse LLM response for screens, widgets, and router additions
 * 4. Merge router additions into scaffold app_router.dart
 * 5. Upload all files (scaffold + LLM-generated)
 *
 * This approach:
 * - Eliminates variance in base files
 * - Reduces LLM hallucination
 * - Ensures consistent project structure
 * - Focuses LLM on creative work (UI implementation)
 */

import { v4 as uuidv4 } from "uuid";

// Models
import {
  Preconditions,
  createEmptyPreconditions,
  validatePreconditions,
} from "../models/generation-contract";
import {
  ParsedFile,
  createArtifactInput,
  GeneratedArtifactInput,
  GeneratedArtifact,
} from "../models/generated-artifact";
import {
  GenerationResult,
  GenerationSessionInput,
  GenerationStatus,
  createValidationError,
  createFailedResult,
  createSuccessResult,
} from "../models/generation-result";

// Services
import { AIProvider } from "./ai-provider-interface";
import { getActiveAIProvider } from "./ai-provider-factory";
import { PromptAssembler, getPromptAssembler } from "./prompt-assembler";
import { ResponseParser, getResponseParser } from "./response-parser";
import { StorageService, getStorageService } from "./storage-service";
import {
  ScaffoldInjector,
  getScaffoldInjector,
  GeneratedScaffold,
} from "./scaffold-injector";

// Repositories
import {
  ArtifactRepository,
  getArtifactRepository,
} from "../repositories/artifact-repository";

// External services
import { ProjectStateService } from "../../project-state/project-state-service";
import { ProjectStateRepository } from "../../project-state/repository";
import { ProjectIdentityService } from "../../project-identity/project-identity-service";
import { ProjectIdentityRepository } from "../../project-identity/repository";
import { ArchitectureService } from "../../architecture/architecture-service";
import { ArchitectureRepository } from "../../architecture/repository";
import { ProjectIdentity } from "../../project-identity/model";
import { ArchitecturePlan } from "../../architecture/model";
import {
  UnsupportedCategoryError,
  validatePromptCategory,
  SUPPORTED_CATEGORIES,
} from "../../architecture/feature-extractor";

// ============================================================================
// Types
// ============================================================================

export interface GenerationContext {
  projectStateId: string;
  userPrompt: string;
  sessionId: string;
  identity?: ProjectIdentity;
  architecture?: ArchitecturePlan;
  scaffold?: GeneratedScaffold;
}

export interface GenerationCallbacks {
  onStatusChange?: (status: GenerationStatus, message: string) => void;
  onToken?: (token: string, accumulated: string) => void;
  onFileStart?: (filePath: string, index: number, total: number) => void;
  onFileComplete?: (filePath: string, size: number) => void;
  onError?: (error: string, retrying: boolean, attempt: number) => void;
  onComplete?: (result: GenerationResult) => void;
}

export interface PreconditionCheckResult {
  valid: boolean;
  preconditions: Preconditions;
  errors: string[];
  identity?: ProjectIdentity;
  architecture?: ArchitecturePlan;
}

// ============================================================================
// Code Generator Service Class
// ============================================================================

export class CodeGeneratorService {
  private readonly aiProvider: AIProvider;
  private readonly promptAssembler: PromptAssembler;
  private readonly responseParser: ResponseParser;
  private readonly storageService: StorageService;
  private readonly scaffoldInjector: ScaffoldInjector;
  private readonly artifactRepository: ArtifactRepository;
  private readonly projectStateService: ProjectStateService;
  private readonly projectIdentityService: ProjectIdentityService;
  private readonly architectureService: ArchitectureService;

  private readonly maxRetries: number = 2;

  constructor(
    aiProvider?: AIProvider,
    promptAssembler?: PromptAssembler,
    responseParser?: ResponseParser,
    storageService?: StorageService,
    scaffoldInjector?: ScaffoldInjector,
    artifactRepository?: ArtifactRepository,
    projectStateService?: ProjectStateService,
    projectIdentityService?: ProjectIdentityService,
    architectureService?: ArchitectureService,
  ) {
    this.aiProvider = aiProvider || getActiveAIProvider();
    this.promptAssembler = promptAssembler || getPromptAssembler();
    this.responseParser = responseParser || getResponseParser();
    this.storageService = storageService || getStorageService();
    this.scaffoldInjector = scaffoldInjector || getScaffoldInjector();
    this.artifactRepository = artifactRepository || getArtifactRepository();

    this.projectStateService =
      projectStateService ||
      new ProjectStateService(new ProjectStateRepository());
    this.projectIdentityService =
      projectIdentityService ||
      new ProjectIdentityService(new ProjectIdentityRepository());
    this.architectureService =
      architectureService ||
      new ArchitectureService(new ArchitectureRepository());
  }

  // ==========================================================================
  // Main Pipeline Entry Point
  // ==========================================================================

  /**
   * Executes the complete Zero-to-One code generation pipeline with scaffold injection
   */
  async executeZeroToOnePipeline(
    input: GenerationSessionInput,
    callbacks?: GenerationCallbacks,
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const sessionId = uuidv4();

    const context: GenerationContext = {
      projectStateId: input.project_state_id,
      userPrompt: input.user_prompt,
      sessionId,
    };

    this.notifyStatus(callbacks, "pending", "Starting generation pipeline...");

    try {
      // Step 0: Validate prompt matches a supported category
      this.notifyStatus(callbacks, "pending", "Validating prompt category...");
      const categoryValidation = validatePromptCategory(input.user_prompt);
      if (!categoryValidation.valid) {
        return createFailedResult(
          [
            createValidationError(
              "unsupported_category",
              categoryValidation.error || "Unsupported app type",
              "error",
            ),
          ],
          {
            model_used: this.aiProvider.getModel(),
            total_time_ms: Date.now() - startTime,
            attempt_number: 1,
            max_attempts: this.maxRetries + 1,
          },
          sessionId,
        );
      }

      // Step 1: Validate preconditions
      this.notifyStatus(callbacks, "pending", "Validating preconditions...");
      const preconditionResult = await this.checkPreconditions(
        context.projectStateId,
      );

      if (!preconditionResult.valid) {
        return createFailedResult(
          preconditionResult.errors.map((e) =>
            createValidationError("unknown", e, "error"),
          ),
          {
            model_used: this.aiProvider.getModel(),
            total_time_ms: Date.now() - startTime,
            attempt_number: 1,
            max_attempts: this.maxRetries + 1,
          },
          sessionId,
        );
      }

      // Step 2: Create or get Project Identity
      this.notifyStatus(
        callbacks,
        "generating",
        "Creating project identity...",
      );
      let identity = preconditionResult.identity;
      if (!identity) {
        identity = await this.createProjectIdentity(context);
        context.identity = identity;

        await this.projectStateService.updateProjectStateById(
          context.projectStateId,
          { identity_id: identity.identity_id },
        );
      } else {
        context.identity = identity;
      }

      // Step 3: Create or get Architecture Plan
      this.notifyStatus(
        callbacks,
        "generating",
        "Generating architecture plan...",
      );
      let architecture = preconditionResult.architecture;
      if (!architecture) {
        architecture = await this.createArchitecturePlan(identity);
        context.architecture = architecture;

        await this.projectStateService.updateProjectStateById(
          context.projectStateId,
          {
            architecture_plan_established: true,
            architecture_decisions_recorded: true,
          },
        );
      } else {
        context.architecture = architecture;
      }

      // Step 4: Generate scaffold (base files)
      this.notifyStatus(
        callbacks,
        "generating",
        "Generating project scaffold...",
      );
      const scaffold = this.scaffoldInjector.generateScaffold(identity);
      context.scaffold = scaffold;

      // Step 5: Execute LLM generation for screens/widgets
      const result = await this.executeGenerationWithRetry(
        context,
        callbacks,
        startTime,
      );

      // Step 6: If successful, lock mode to ONE_TO_N
      if (result.success) {
        await this.projectStateService.updateProjectStateById(
          context.projectStateId,
          {
            mode_locked: "ONE_TO_N",
            artifact_count: result.files_count,
          },
        );

        this.notifyStatus(callbacks, "completed", "Generation complete!");
      }

      if (callbacks?.onComplete) {
        callbacks.onComplete(result);
      }

      return result;
    } catch (error) {
      // Handle unsupported category error specifically
      if (error instanceof UnsupportedCategoryError) {
        this.notifyError(
          callbacks,
          `Unsupported app type. Supported categories: ${SUPPORTED_CATEGORIES.join(", ")}`,
          false,
          1,
        );
        return createFailedResult(
          [
            createValidationError(
              "unsupported_category",
              error.message,
              "error",
            ),
          ],
          {
            model_used: this.aiProvider.getModel(),
            total_time_ms: Date.now() - startTime,
            attempt_number: 1,
            max_attempts: this.maxRetries + 1,
          },
          sessionId,
        );
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.notifyError(callbacks, errorMessage, false, this.maxRetries + 1);

      return createFailedResult(
        [createValidationError("unknown", errorMessage, "error")],
        {
          model_used: this.aiProvider.getModel(),
          total_time_ms: Date.now() - startTime,
          attempt_number: this.maxRetries + 1,
          max_attempts: this.maxRetries + 1,
        },
        sessionId,
      );
    }
  }

  // ==========================================================================
  // Precondition Checking
  // ==========================================================================

  async checkPreconditions(
    projectStateId: string,
  ): Promise<PreconditionCheckResult> {
    const errors: string[] = [];
    const preconditions = createEmptyPreconditions();

    const projectState =
      await this.projectStateService.getProjectStateById(projectStateId);
    if (!projectState) {
      errors.push("Project state not found");
      return { valid: false, preconditions, errors };
    }

    preconditions.mode_is_zero_to_one =
      projectState.mode_locked === "ZERO_TO_ONE";
    if (!preconditions.mode_is_zero_to_one) {
      errors.push(
        "Project is not in ZERO_TO_ONE mode. Cannot generate initial artifacts.",
      );
    }

    const artifactCount =
      await this.artifactRepository.countByProjectStateId(projectStateId);
    preconditions.no_artifacts_exist = artifactCount === 0;
    if (!preconditions.no_artifacts_exist) {
      errors.push(
        "Artifacts already exist for this project. Zero-to-One generation only allowed for new projects.",
      );
    }

    let identity: ProjectIdentity | undefined;
    if (projectState.identity_id) {
      identity =
        (await this.projectIdentityService.getById(projectState.identity_id)) ||
        undefined;
    }
    preconditions.project_identity_exists = !!identity;

    let architecture: ArchitecturePlan | undefined;
    if (identity) {
      architecture =
        (await this.architectureService.getArchitecturePlan(
          identity.identity_id,
        )) || undefined;
    }
    preconditions.architecture_plan_exists = !!architecture;
    preconditions.intent_is_creation = true;

    const criticalErrors = errors.filter(
      (e) => e.includes("ZERO_TO_ONE") || e.includes("Artifacts already exist"),
    );

    return {
      valid: criticalErrors.length === 0,
      preconditions,
      errors: criticalErrors,
      identity,
      architecture,
    };
  }

  // ==========================================================================
  // Identity and Architecture Creation
  // ==========================================================================

  private async createProjectIdentity(
    context: GenerationContext,
  ): Promise<ProjectIdentity> {
    return await this.projectIdentityService.create({
      purpose: context.userPrompt,
    });
  }

  private async createArchitecturePlan(
    identity: ProjectIdentity,
  ): Promise<ArchitecturePlan> {
    return await this.architectureService.createArchitecturePlan(identity);
  }

  // ==========================================================================
  // Generation with Retry (Scaffold-Based)
  // ==========================================================================

  private async executeGenerationWithRetry(
    context: GenerationContext,
    callbacks: GenerationCallbacks | undefined,
    pipelineStartTime: number,
  ): Promise<GenerationResult> {
    let lastError: string = "";
    let lastResponse: string = "";

    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      const attemptStartTime = Date.now();

      try {
        this.notifyStatus(
          callbacks,
          attempt > 1 ? "retrying" : "generating",
          attempt > 1
            ? `Retry attempt ${attempt}...`
            : "Generating screens and widgets...",
        );

        // Assemble scaffold-based prompt
        const prompt =
          attempt === 1
            ? this.promptAssembler.assembleScaffoldBasedPrompt(
                context.userPrompt,
                context.identity!,
                context.architecture!,
                context.scaffold!,
              )
            : this.promptAssembler.assembleRetryPrompt(
                context.userPrompt,
                lastError,
                lastResponse,
                context.scaffold!,
              );

        // Generate code via LLM
        let accumulatedContent = "";
        const response = await this.aiProvider.streamGenerateWithRetry(
          prompt,
          { maxTokens: this.calculateMaxTokens(context.architecture!) },
          0,
          (chunk) => {
            accumulatedContent += chunk;
            if (callbacks?.onToken) {
              callbacks.onToken(chunk, accumulatedContent);
            }
          },
        );

        lastResponse = response.content;

        // Parse response (screens, widgets, router additions)
        this.notifyStatus(callbacks, "validating", "Parsing generated code...");
        const parsedResponse = this.responseParser.parseResponse(
          response.content,
          context.architecture!,
        );

        if (!parsedResponse.success) {
          lastError = parsedResponse.errors.map((e) => e.message).join("; ");
          throw new Error(lastError);
        }

        // Validate files
        this.notifyStatus(
          callbacks,
          "validating",
          "Validating code quality...",
        );
        const validationResult = this.responseParser.validateFiles(
          parsedResponse.files,
          context.architecture!,
        );

        if (!validationResult.valid) {
          lastError = validationResult.errors.map((e) => e.message).join("; ");
          throw new Error(lastError);
        }

        // Merge scaffold with LLM output
        this.notifyStatus(
          callbacks,
          "uploading",
          "Merging scaffold with generated code...",
        );
        const allFiles = this.mergeScaffoldWithGenerated(
          context.scaffold!,
          parsedResponse.files,
          parsedResponse.routerAdditions,
        );

        // Upload all files to storage
        this.notifyStatus(
          callbacks,
          "uploading",
          "Uploading files to storage...",
        );
        const uploadResult = await this.uploadFiles(
          context.projectStateId,
          allFiles,
          callbacks,
        );

        if (!uploadResult.success) {
          lastError = uploadResult.errors.join("; ");
          throw new Error(lastError);
        }

        // Create artifact metadata
        this.notifyStatus(
          callbacks,
          "uploading",
          "Saving artifact metadata...",
        );
        const artifacts = await this.createArtifactRecords(
          context.projectStateId,
          context.identity!.identity_id,
          context.architecture!.plan_id,
          allFiles,
        );

        const totalTime = Date.now() - pipelineStartTime;
        const generationTime = Date.now() - attemptStartTime;

        return createSuccessResult(
          artifacts,
          {
            model_used: response.model,
            tokens_prompt: response.usage.promptTokens,
            tokens_completion: response.usage.completionTokens,
            tokens_total: response.usage.totalTokens,
            generation_time_ms: generationTime,
            total_time_ms: totalTime,
            attempt_number: attempt,
            max_attempts: this.maxRetries + 1,
          },
          context.sessionId,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        lastError = errorMessage;

        const isLastAttempt = attempt === this.maxRetries + 1;
        this.notifyError(callbacks, errorMessage, !isLastAttempt, attempt);

        if (isLastAttempt) {
          return createFailedResult(
            [createValidationError("unknown", errorMessage, "error")],
            {
              model_used: this.aiProvider.getModel(),
              total_time_ms: Date.now() - pipelineStartTime,
              attempt_number: attempt,
              max_attempts: this.maxRetries + 1,
            },
            context.sessionId,
          );
        }

        const delayMs = Math.pow(2, attempt - 1) * 2000;
        await this.sleep(delayMs);
      }
    }

    return createFailedResult(
      [
        createValidationError(
          "unknown",
          "Unexpected error in generation loop",
          "error",
        ),
      ],
      {
        model_used: this.aiProvider.getModel(),
        total_time_ms: Date.now() - pipelineStartTime,
        attempt_number: this.maxRetries + 1,
        max_attempts: this.maxRetries + 1,
      },
      context.sessionId,
    );
  }

  // ==========================================================================
  // Scaffold Merging
  // ==========================================================================

  /**
   * Merges scaffold files with LLM-generated files.
   * Router additions are merged into app_router.dart.
   */
  private mergeScaffoldWithGenerated(
    scaffold: GeneratedScaffold,
    generatedFiles: ParsedFile[],
    routerAdditions: {
      imports: string[];
      routeConstants: string[];
      routeCases: string[];
    },
  ): ParsedFile[] {
    const allFiles: ParsedFile[] = [];

    // Add scaffold files
    for (const scaffoldFile of scaffold.files) {
      if (scaffoldFile.path === "lib/routing/app_router.dart") {
        // Merge router additions
        const mergedContent = this.scaffoldInjector.mergeRouterAdditions(
          scaffoldFile.content,
          routerAdditions,
        );
        allFiles.push({
          path: scaffoldFile.path,
          content: mergedContent,
          isEntryPoint: false,
        });
      } else {
        allFiles.push({
          path: scaffoldFile.path,
          content: scaffoldFile.content,
          isEntryPoint: scaffoldFile.path === "lib/main.dart",
        });
      }
    }

    // Add LLM-generated files (screens and widgets)
    for (const file of generatedFiles) {
      allFiles.push(file);
    }

    return allFiles;
  }

  // ==========================================================================
  // File Operations
  // ==========================================================================

  private async uploadFiles(
    projectStateId: string,
    files: ParsedFile[],
    callbacks?: GenerationCallbacks,
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (callbacks?.onFileStart) {
        callbacks.onFileStart(file.path, i + 1, files.length);
      }

      const result = await this.storageService.uploadFile(
        projectStateId,
        file.path,
        file.content,
      );

      if (!result.success) {
        errors.push(`Failed to upload ${file.path}: ${result.error}`);
      } else if (callbacks?.onFileComplete) {
        callbacks.onFileComplete(file.path, file.content.length);
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  private async createArtifactRecords(
    projectStateId: string,
    identityId: string,
    architecturePlanId: string,
    files: ParsedFile[],
  ): Promise<GeneratedArtifact[]> {
    const inputs: GeneratedArtifactInput[] = files.map((file, index) =>
      createArtifactInput(
        file,
        projectStateId,
        identityId,
        architecturePlanId,
        index,
      ),
    );

    return await this.artifactRepository.createMany(inputs);
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  private calculateMaxTokens(architecture: ArchitecturePlan): number {
    const baseTokens = 2000; // Base for screens/widgets only (no scaffold)

    const complexityMultiplier: Record<string, number> = {
      simple: 1.0,
      moderate: 1.5,
      complex: 2.0,
      enterprise: 2.5,
    };

    const multiplier =
      complexityMultiplier[architecture.complexity_level] || 1.0;
    const calculated = Math.ceil(baseTokens * multiplier);

    const envLimit = parseInt(process.env.GEMINI_MAX_TOKENS || "4000", 10);
    return Math.min(calculated, envLimit);
  }

  private notifyStatus(
    callbacks: GenerationCallbacks | undefined,
    status: GenerationStatus,
    message: string,
  ): void {
    if (callbacks?.onStatusChange) {
      callbacks.onStatusChange(status, message);
    }
  }

  private notifyError(
    callbacks: GenerationCallbacks | undefined,
    error: string,
    retrying: boolean,
    attempt: number,
  ): void {
    if (callbacks?.onError) {
      callbacks.onError(error, retrying, attempt);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ==========================================================================
  // Public Utilities
  // ==========================================================================

  async testAIProviderConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const isConnected = await this.aiProvider.testConnection();
      return {
        success: isConnected,
        message: isConnected
          ? `${this.aiProvider.getProviderName()} connection successful`
          : `${this.aiProvider.getProviderName()} connection failed`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `${this.aiProvider.getProviderName()} connection error: ${errorMessage}`,
      };
    }
  }

  getConfiguration(): {
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
    return {
      provider: this.aiProvider.getProviderName(),
      model: this.aiProvider.getModel(),
      maxRetries: this.maxRetries,
      storageBucket: this.storageService.getBucketName(),
      rateLimitStatus: this.aiProvider.getRateLimitStatus(),
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultService: CodeGeneratorService | null = null;

export function getCodeGeneratorService(): CodeGeneratorService {
  if (!defaultService) {
    defaultService = new CodeGeneratorService();
  }
  return defaultService;
}

export function createCodeGeneratorService(
  aiProvider?: AIProvider,
  promptAssembler?: PromptAssembler,
  responseParser?: ResponseParser,
  storageService?: StorageService,
  scaffoldInjector?: ScaffoldInjector,
  artifactRepository?: ArtifactRepository,
  projectStateService?: ProjectStateService,
  projectIdentityService?: ProjectIdentityService,
  architectureService?: ArchitectureService,
): CodeGeneratorService {
  return new CodeGeneratorService(
    aiProvider,
    promptAssembler,
    responseParser,
    storageService,
    scaffoldInjector,
    artifactRepository,
    projectStateService,
    projectIdentityService,
    architectureService,
  );
}
