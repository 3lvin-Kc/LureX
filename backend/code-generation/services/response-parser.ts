/**
 * Response Parser Service
 *
 * Parses and validates the AI-generated response from OpenRouter.
 *
 * SCAFFOLD-BASED APPROACH:
 * The LLM does NOT create base files (pubspec.yaml, main.dart, app.dart, app_router.dart).
 * Instead, it provides:
 * 1. Router additions (imports, route constants, route cases)
 * 2. Screen files in lib/screens/
 * 3. Widget files in lib/widgets/ (optional)
 *
 * This parser extracts these components and validates them.
 *
 * VALIDATION LEVELS:
 * 1. High-level: Screen count, architecture compliance
 * 2. Low-level: Import validation, cross-file dependencies, router consistency
 *
 * ROBUSTNESS:
 * - Strips <think>...</think> tags from R1 models
 * - Handles multiple delimiter formats
 * - Falls back to markdown code blocks
 */

import { ParsedFile } from "../models/generated-artifact";
import {
  ValidationError,
  createValidationError,
} from "../models/generation-result";
import { ArchitecturePlan } from "../../architecture/model";
import { DELIMITERS, FOLDER_CONVENTIONS } from "./base-structure-template";
import { RouterAdditions } from "./scaffold-injector";

// ============================================================================
// Types
// ============================================================================

export interface ParsedResponse {
  success: boolean;
  files: ParsedFile[];
  routerAdditions: RouterAdditions;
  errors: ValidationError[];
  warnings: ValidationError[];
  rawResponse: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Files that LLM should NOT create - they are injected by scaffold
 */
const SCAFFOLD_FILES = [
  "pubspec.yaml",
  "lib/main.dart",
  "lib/app.dart",
  "lib/routing/app_router.dart",
];

/**
 * Files that are always available (scaffold + packages)
 */
const ALWAYS_AVAILABLE_IMPORTS = [
  "package:flutter/material.dart",
  "package:flutter/widgets.dart",
  "package:flutter/services.dart",
  "package:flutter/foundation.dart",
  "package:shadcn_ui/shadcn_ui.dart",
];

/**
 * Forbidden imports for screen files
 */
const FORBIDDEN_SCREEN_IMPORTS = [
  "../routing/app_router.dart",
  "app_router.dart",
  "../main.dart",
  "main.dart",
];

// ============================================================================
// Response Parser Class
// ============================================================================

export class ResponseParser {
  /**
   * Preprocesses the response to remove thinking tags and normalize content.
   * R1 models often include <think>...</think> sections that should be stripped.
   */
  private preprocessResponse(rawResponse: string): string {
    let processed = rawResponse;

    // Strip <think>...</think> tags (DeepSeek R1 reasoning)
    processed = processed.replace(/<think>[\s\S]*?<\/think>/gi, "");

    // Strip <reasoning>...</reasoning> tags
    processed = processed.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "");

    // Strip markdown thinking blocks
    processed = processed.replace(/```thinking[\s\S]*?```/gi, "");

    // Remove excessive whitespace but preserve code structure
    processed = processed.replace(/\n{4,}/g, "\n\n\n");

    return processed.trim();
  }

  /**
   * Parses the AI response for scaffold-based generation.
   * Extracts router additions, screens, and widgets.
   * Rejects any attempts to create scaffold files.
   */
  parseResponse(
    rawResponse: string,
    architecture?: ArchitecturePlan,
  ): ParsedResponse {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let files: ParsedFile[] = [];

    // Preprocess to remove thinking sections
    const cleanedResponse = this.preprocessResponse(rawResponse);

    // Step 1: Parse router additions
    const routerAdditions = this.parseRouterAdditions(cleanedResponse);

    // Step 2: Parse screen and widget files
    const fileParseResult = this.parseFiles(cleanedResponse);

    if (fileParseResult.success) {
      files = fileParseResult.files;
    } else {
      errors.push(...fileParseResult.errors);
    }

    // Step 3: Reject any scaffold files that LLM tried to create
    const scaffoldAttempts = files.filter((f) =>
      SCAFFOLD_FILES.includes(f.path),
    );
    if (scaffoldAttempts.length > 0) {
      for (const attempt of scaffoldAttempts) {
        warnings.push(
          createValidationError(
            "file_location_warning",
            `Ignoring "${attempt.path}" - this is a scaffold file managed by the system`,
            "warning",
            attempt.path,
          ),
        );
      }
      // Filter out scaffold files
      files = files.filter((f) => !SCAFFOLD_FILES.includes(f.path));
    }

    // Step 4: Validate file locations
    for (const file of files) {
      if (!this.isValidFilePath(file.path)) {
        errors.push(
          createValidationError(
            "invalid_file_location",
            `File "${file.path}" is not in a valid location. Screens must be in lib/screens/, widgets in lib/widgets/`,
            "error",
            file.path,
          ),
        );
      }
    }

    // Step 5: Validate screen count against feature analysis requirements
    const screenFiles = files.filter((f) =>
      f.path.startsWith(FOLDER_CONVENTIONS.screens),
    );

    if (architecture?.feature_analysis) {
      const { screen_requirements } = architecture.feature_analysis;

      // Hard check: minimum screen count
      if (screenFiles.length < screen_requirements.minimum) {
        errors.push(
          createValidationError(
            "missing_screen",
            `Architecture requires at least ${screen_requirements.minimum} screen(s), but only ${screenFiles.length} generated. Please create more screens to handle the identified features.`,
            "error",
          ),
        );
      }

      // Soft check: recommended screen count
      else if (screenFiles.length < screen_requirements.recommended) {
        const shortage = screen_requirements.recommended - screenFiles.length;
        warnings.push(
          createValidationError(
            "incomplete",
            `Generated ${screenFiles.length} screen(s) but ${screen_requirements.recommended} recommended for optimal feature coverage. Consider adding ${shortage} more screen(s).`,
            "warning",
          ),
        );
      }
    } else {
      // Fallback: basic screen check if no architecture plan
      if (screenFiles.length === 0) {
        errors.push(
          createValidationError(
            "missing_screen",
            "At least one screen file is required in lib/screens/",
            "error",
          ),
        );
      }
    }

    // Step 6: Validate against architecture plan if provided
    if (architecture) {
      const architectureValidation = this.validateFiles(files, architecture);
      errors.push(...architectureValidation.errors);
      warnings.push(...architectureValidation.warnings);
    }

    // Step 7: Validate router additions match created screens
    if (files.length > 0 && routerAdditions.imports.length > 0) {
      const screenValidation = this.validateRouterMatchesScreens(
        routerAdditions,
        files,
      );
      errors.push(...screenValidation.errors);
      warnings.push(...screenValidation.warnings);
    }

    // Step 8: Check if router additions are missing for screens
    if (screenFiles.length > 0 && routerAdditions.imports.length === 0) {
      errors.push(
        createValidationError(
          "missing_router",
          "Screen files created but no router additions provided. Each screen must have a corresponding route.",
          "error",
        ),
      );
    }

    // Step 9: Validate cross-file imports (screens can only import widgets, not each other or router)
    const importValidation = this.validateImports(files);
    errors.push(...importValidation.errors);
    warnings.push(...importValidation.warnings);

    // Step 10: Validate that all widget imports exist in generated files
    const widgetImportValidation = this.validateWidgetImportsExist(files);
    errors.push(...widgetImportValidation.errors);
    warnings.push(...widgetImportValidation.warnings);

    // Step 11: Validate router imports match screen files
    const routerImportValidation = this.validateRouterImportsComplete(
      routerAdditions,
      screenFiles,
    );
    errors.push(...routerImportValidation.errors);
    warnings.push(...routerImportValidation.warnings);

    return {
      success: errors.length === 0 && files.length > 0,
      files,
      routerAdditions,
      errors,
      warnings,
      rawResponse,
    };
  }

  /**
   * Validates parsed files against architecture plan
   */
  validateFiles(
    files: ParsedFile[],
    architecture: ArchitecturePlan,
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Step 1: Check minimum screen requirements from architecture plan
    if (architecture.feature_analysis?.screen_requirements) {
      const screenRequirements =
        architecture.feature_analysis.screen_requirements;
      const screenFiles = files.filter((f) =>
        f.path.startsWith(FOLDER_CONVENTIONS.screens),
      );
      const actualScreenCount = screenFiles.length;

      // Error if below minimum required screens
      if (actualScreenCount < screenRequirements.minimum) {
        errors.push(
          createValidationError(
            "missing_screen",
            `Insufficient screens: Generated ${actualScreenCount} screen(s) but architecture requires at least ${screenRequirements.minimum} screen(s)`,
            "error",
          ),
        );
      }
      // Warning if below recommended screens
      else if (actualScreenCount < screenRequirements.recommended) {
        warnings.push(
          createValidationError(
            "incomplete",
            `Below recommended screens: Generated ${actualScreenCount} screen(s) but architecture recommends ${screenRequirements.recommended} screen(s)`,
            "warning",
          ),
        );
      }
      // Warning if exceeding maximum screens
      else if (actualScreenCount > screenRequirements.maximum) {
        warnings.push(
          createValidationError(
            "incomplete",
            `Exceeds maximum screens: Generated ${actualScreenCount} screen(s) but architecture recommends maximum ${screenRequirements.maximum} screen(s)`,
            "warning",
          ),
        );
      }
    }

    // Step 2: Validate individual files
    for (const file of files) {
      // Validate Dart syntax (basic checks)
      if (file.path.endsWith(".dart")) {
        const syntaxResult = this.validateDartSyntax(file);
        errors.push(...syntaxResult.errors);
        warnings.push(...syntaxResult.warnings);
      }

      // Validate naming conventions
      const namingResult = this.validateNamingConventions(
        file,
        architecture.naming_conventions,
      );
      errors.push(...namingResult.errors);
      warnings.push(...namingResult.warnings);

      // Check for TODOs and placeholders
      const placeholderResult = this.checkForPlaceholders(file);
      warnings.push(...placeholderResult.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Parses router additions from the response
   */
  private parseRouterAdditions(response: string): RouterAdditions {
    const additions: RouterAdditions = {
      imports: [],
      routeConstants: [],
      routeCases: [],
    };

    // Try to find router additions section
    const routerMatch = response.match(
      /<<<ROUTER_ADDITIONS>>>([\s\S]*?)<<<END_ROUTER_ADDITIONS>>>/i,
    );

    // Also try alternative format
    const altMatch = response.match(
      /ROUTER_ADDITIONS:?\s*([\s\S]*?)(?=<<<FILE_START>>>|$)/i,
    );

    const routerContent = routerMatch?.[1] || altMatch?.[1] || "";

    if (!routerContent.trim()) {
      return additions;
    }

    // Parse IMPORTS section
    const importsMatch = routerContent.match(
      /IMPORTS:\s*([\s\S]*?)(?=ROUTES:|CASES:|$)/i,
    );
    if (importsMatch) {
      additions.imports = importsMatch[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("import "));
    }

    // Parse ROUTES section
    const routesMatch = routerContent.match(
      /ROUTES:\s*([\s\S]*?)(?=CASES:|IMPORTS:|$)/i,
    );
    if (routesMatch) {
      additions.routeConstants = routesMatch[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("static const"));
    }

    // Parse CASES section
    const casesMatch = routerContent.match(
      /CASES:\s*([\s\S]*?)(?=IMPORTS:|ROUTES:|$)/i,
    );
    if (casesMatch) {
      const caseLines = casesMatch[1].split("\n");
      let currentCase: string[] = [];

      for (const line of caseLines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("case ")) {
          if (currentCase.length > 0) {
            additions.routeCases.push(currentCase.join("\n"));
          }
          currentCase = [trimmed];
        } else if (trimmed && currentCase.length > 0) {
          currentCase.push(trimmed);
        }
      }
      if (currentCase.length > 0) {
        additions.routeCases.push(currentCase.join("\n"));
      }
    }

    return additions;
  }

  /**
   * Parses files from the response using multiple format detection strategies
   */
  private parseFiles(response: string): {
    success: boolean;
    files: ParsedFile[];
    errors: ValidationError[];
  } {
    let files: ParsedFile[] = [];
    const errors: ValidationError[] = [];

    // Check for delimiters
    const hasDelimiters =
      response.includes(DELIMITERS.FILE_START) ||
      response.includes("<<<FILE") ||
      response.includes("```dart") ||
      response.includes("```yaml") ||
      response.includes("// FILE:") ||
      response.includes("## lib/") ||
      response.includes("**lib/");

    if (!hasDelimiters) {
      errors.push(
        createValidationError(
          "parse_error",
          "No file content found in response. Expected screen/widget files with delimiters.",
          "error",
        ),
      );
      return { success: false, files: [], errors };
    }

    // Try standard delimiter format first
    if (response.includes(DELIMITERS.FILE_START)) {
      const result = this.parseStandardDelimiters(response);
      if (result.files.length > 0) {
        files = result.files;
      }
    }

    // Try alternative delimiter formats (<<<FILE_PATH>>> style)
    if (files.length === 0 && response.includes("<<<")) {
      const result = this.parseAlternativeDelimiters(response);
      if (result.files.length > 0) {
        files = result.files;
      }
    }

    // Try markdown code block format
    if (
      files.length === 0 &&
      (response.includes("```dart") || response.includes("```yaml"))
    ) {
      const result = this.parseMarkdownCodeBlocks(response);
      if (result.files.length > 0) {
        files = result.files;
      }
    }

    // Try comment-based format
    if (
      files.length === 0 &&
      (response.includes("// FILE:") || response.includes("## File:"))
    ) {
      const result = this.parseCommentBasedFormat(response);
      if (result.files.length > 0) {
        files = result.files;
      }
    }

    // Try header-based format (## lib/screens/home_screen.dart)
    if (files.length === 0) {
      const result = this.parseHeaderBasedFormat(response);
      if (result.files.length > 0) {
        files = result.files;
      }
    }

    // Filter out any scaffold files that snuck through
    files = files.filter((f) => !SCAFFOLD_FILES.includes(f.path));

    if (files.length === 0) {
      errors.push(
        createValidationError(
          "parse_error",
          "Could not extract screen/widget files from response. The model may not have followed the output format.",
          "error",
        ),
      );
    }

    return { success: files.length > 0, files, errors };
  }

  /**
   * Parse alternative delimiter formats (variations the LLM might use)
   */
  private parseAlternativeDelimiters(response: string): {
    success: boolean;
    files: ParsedFile[];
    errors: ValidationError[];
  } {
    const files: ParsedFile[] = [];
    const errors: ValidationError[] = [];

    // Pattern: <<<FILE_PATH: lib/screens/home_screen.dart>>>
    const altPattern =
      /<<<FILE_PATH:\s*([\w\/\._-]+\.dart)>>>\s*\n([\s\S]*?)(?=<<<FILE_PATH:|<<<END>>>|$)/gi;
    let match;

    while ((match = altPattern.exec(response)) !== null) {
      const path = this.normalizePath(match[1]);
      const content = match[2].trim();

      if (path && content) {
        files.push({
          path,
          content,
          isEntryPoint: path === "lib/main.dart",
        });
      }
    }

    // Pattern: <<<lib/screens/home_screen.dart>>>
    const simplePattern =
      /<<<(lib\/[\w\/\._-]+\.dart)>>>\s*\n([\s\S]*?)(?=<<<lib\/|<<<END>>>|$)/gi;

    while ((match = simplePattern.exec(response)) !== null) {
      const path = this.normalizePath(match[1]);
      const content = match[2].trim();

      if (path && content && !files.some((f) => f.path === path)) {
        files.push({
          path,
          content,
          isEntryPoint: path === "lib/main.dart",
        });
      }
    }

    return { success: files.length > 0, files, errors };
  }

  /**
   * Parse header-based format (## lib/screens/home_screen.dart)
   */
  private parseHeaderBasedFormat(response: string): {
    success: boolean;
    files: ParsedFile[];
    errors: ValidationError[];
  } {
    const files: ParsedFile[] = [];
    const errors: ValidationError[] = [];

    // Pattern: ## lib/screens/home_screen.dart
    const headerPattern =
      /##\s+(lib\/[\w\/\._-]+\.dart)\s*\n```(?:dart)?\s*\n([\s\S]*?)```/gi;
    let match;

    while ((match = headerPattern.exec(response)) !== null) {
      const path = this.normalizePath(match[1]);
      const content = match[2].trim();

      if (path && content) {
        files.push({
          path,
          content,
          isEntryPoint: path === "lib/main.dart",
        });
      }
    }

    // Pattern: **lib/screens/home_screen.dart**
    const boldPattern =
      /\*\*(lib\/[\w\/\._-]+\.dart)\*\*\s*\n```(?:dart)?\s*\n([\s\S]*?)```/gi;

    while ((match = boldPattern.exec(response)) !== null) {
      const path = this.normalizePath(match[1]);
      const content = match[2].trim();

      if (path && content && !files.some((f) => f.path === path)) {
        files.push({
          path,
          content,
          isEntryPoint: path === "lib/main.dart",
        });
      }
    }

    return { success: files.length > 0, files, errors };
  }

  /**
   * Parse using standard delimiter format
   */
  private parseStandardDelimiters(response: string): {
    success: boolean;
    files: ParsedFile[];
    errors: ValidationError[];
  } {
    const files: ParsedFile[] = [];
    const errors: ValidationError[] = [];

    const blocks = response.split(DELIMITERS.FILE_START);

    for (const block of blocks) {
      if (!block.trim() || !block.includes(DELIMITERS.FILE_END)) {
        continue;
      }

      const endIndex = block.indexOf(DELIMITERS.FILE_END);
      const fileBlock = block.substring(0, endIndex);

      let path = "";
      let content = "";

      if (fileBlock.includes(DELIMITERS.FILE_PATH)) {
        const pathStart =
          fileBlock.indexOf(DELIMITERS.FILE_PATH) + DELIMITERS.FILE_PATH.length;
        const contentStart = fileBlock.includes(DELIMITERS.FILE_CONTENT)
          ? fileBlock.indexOf(DELIMITERS.FILE_CONTENT)
          : fileBlock.length;

        path = fileBlock.substring(pathStart, contentStart).trim();

        if (fileBlock.includes(DELIMITERS.FILE_CONTENT)) {
          content = fileBlock
            .substring(contentStart + DELIMITERS.FILE_CONTENT.length)
            .trim();
        }
      } else {
        // Try to extract path from first line
        const lines = fileBlock.split("\n");
        let contentStartLine = 0;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.match(/^lib\/[\w\/\._-]+\.dart$/)) {
            path = line;
            contentStartLine = i + 1;
            break;
          } else if (
            line === DELIMITERS.FILE_CONTENT ||
            line.toLowerCase() === "content:"
          ) {
            contentStartLine = i + 1;
            break;
          }
        }

        if (path) {
          content = lines.slice(contentStartLine).join("\n").trim();
        }
      }

      if (path && content) {
        const normalizedPath = this.normalizePath(path);
        if (normalizedPath) {
          files.push({
            path: normalizedPath,
            content,
            isEntryPoint: normalizedPath === "lib/main.dart",
          });
        }
      }
    }

    return {
      success: files.length > 0,
      files,
      errors,
    };
  }

  /**
   * Parse markdown code blocks with file paths
   */
  private parseMarkdownCodeBlocks(response: string): {
    success: boolean;
    files: ParsedFile[];
    errors: ValidationError[];
  } {
    const files: ParsedFile[] = [];
    const errors: ValidationError[] = [];

    // Pattern: ```dart:lib/screens/home_screen.dart or ```dart lib/screens/...
    const codeBlockRegex =
      /```(?:dart)?[:\s]*(lib\/[\w\/\._-]+\.dart)?\s*\n([\s\S]*?)```/gi;
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      let path = match[1] || "";
      const content = match[2].trim();

      if (!path && content) {
        // Try to find path in preceding text
        const precedingText = response.substring(
          Math.max(0, match.index - 100),
          match.index,
        );
        const pathMatch = precedingText.match(/(?:lib\/[\w\/\._-]+\.dart)/);
        if (pathMatch) {
          path = pathMatch[0];
        }
      }

      if (path && content) {
        const normalizedPath = this.normalizePath(path);
        if (normalizedPath && !files.some((f) => f.path === normalizedPath)) {
          files.push({
            path: normalizedPath,
            content,
            isEntryPoint: normalizedPath === "lib/main.dart",
          });
        }
      }
    }

    // Try header-based blocks: ### lib/screens/home_screen.dart
    const headerBlockRegex =
      /###?\s+(lib\/[\w\/\._-]+\.dart)\s*\n```(?:dart)?\s*\n([\s\S]*?)```/gi;

    while ((match = headerBlockRegex.exec(response)) !== null) {
      const path = this.normalizePath(match[1]);
      const content = match[2].trim();

      if (path && content && !files.some((f) => f.path === path)) {
        files.push({
          path,
          content,
          isEntryPoint: path === "lib/main.dart",
        });
      }
    }

    // Try inline path format: // lib/screens/home_screen.dart
    const inlinePathRegex =
      /\/\/\s*(lib\/[\w\/\._-]+\.dart)\s*\n([\s\S]*?)(?=\/\/\s*lib\/|$)/gi;

    while ((match = inlinePathRegex.exec(response)) !== null) {
      const path = this.normalizePath(match[1]);
      const content = match[2].trim();

      if (path && content && !files.some((f) => f.path === path)) {
        // Remove trailing code block markers
        const cleanContent = content.replace(/```$/g, "").trim();
        files.push({
          path,
          content: cleanContent,
          isEntryPoint: path === "lib/main.dart",
        });
      }
    }

    // Try text-based path: File: lib/screens/home_screen.dart
    const textPathRegex =
      /File:\s*(lib\/[\w\/\._-]+\.dart)\s*\n```(?:dart)?\s*\n([\s\S]*?)```/gi;

    while ((match = textPathRegex.exec(response)) !== null) {
      const path = this.normalizePath(match[1]);
      const content = match[2].trim();

      if (path && content && !files.some((f) => f.path === path)) {
        files.push({
          path,
          content,
          isEntryPoint: path === "lib/main.dart",
        });
      }
    }

    return {
      success: files.length > 0,
      files,
      errors,
    };
  }

  /**
   * Parse comment-based file format
   */
  private parseCommentBasedFormat(response: string): {
    success: boolean;
    files: ParsedFile[];
    errors: ValidationError[];
  } {
    const files: ParsedFile[] = [];
    const errors: ValidationError[] = [];

    const fileMarkerRegex = /\/\/\s*FILE:\s*(lib\/[\w\/\._-]+\.dart)/gi;
    const parts = response.split(fileMarkerRegex);

    for (let i = 1; i < parts.length; i += 2) {
      const path = this.normalizePath(parts[i]);
      let content = parts[i + 1] || "";

      // Clean up content - remove until next FILE marker or end
      const nextFileIndex = content.search(
        /\/\/\s*FILE:\s*lib\/[\w\/\._-]+\.dart/i,
      );
      if (nextFileIndex > 0) {
        content = content.substring(0, nextFileIndex);
      }

      content = content.trim();

      // Remove code block markers if present
      content = content.replace(/^```(?:dart)?\s*\n/, "").replace(/\n```$/, "");

      if (path && content) {
        files.push({
          path,
          content,
          isEntryPoint: path === "lib/main.dart",
        });
      }
    }

    return {
      success: files.length > 0,
      files,
      errors,
    };
  }

  /**
   * Checks if a file path is in a valid location (lib/screens/ or lib/widgets/)
   */
  private isValidFilePath(path: string): boolean {
    return (
      path.startsWith(FOLDER_CONVENTIONS.screens) ||
      path.startsWith(FOLDER_CONVENTIONS.widgets)
    );
  }

  /**
   * Validates that router additions match created screens
   */
  private validateRouterMatchesScreens(
    additions: RouterAdditions,
    files: ParsedFile[],
  ): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const screenPaths = files
      .filter((f) => f.path.startsWith(FOLDER_CONVENTIONS.screens))
      .map((f) => f.path);

    for (const imp of additions.imports) {
      const match = imp.match(/import\s+['"]\.\.\/screens\/(\w+)\.dart['"]/);
      if (match) {
        const screenFile = `lib/screens/${match[1]}.dart`;
        if (!screenPaths.includes(screenFile)) {
          errors.push(
            createValidationError(
              "missing_import_target",
              `Router imports '${screenFile}' but this screen was not generated. Create the screen or remove the import.`,
              "error",
            ),
          );
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validates that all widget imports in screen files reference files that were generated
   */
  private validateWidgetImportsExist(files: ParsedFile[]): {
    errors: ValidationError[];
    warnings: ValidationError[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Build set of all generated file paths
    const generatedPaths = new Set<string>(files.map((f) => f.path));

    // Add scaffold files that always exist
    generatedPaths.add("lib/main.dart");
    generatedPaths.add("lib/app.dart");
    generatedPaths.add("lib/routing/app_router.dart");

    for (const file of files) {
      if (!file.path.endsWith(".dart")) continue;

      // Find all relative imports
      const importRegex = /import\s+['"](\.\.[\/\\][^'"]+\.dart)['"]/g;
      let match;

      while ((match = importRegex.exec(file.content)) !== null) {
        const importPath = match[1];

        // Resolve the import path relative to the file
        const resolvedPath = this.resolveImportPath(file.path, importPath);

        if (resolvedPath && !generatedPaths.has(resolvedPath)) {
          // Check if it's a widget import
          if (resolvedPath.startsWith("lib/widgets/")) {
            errors.push(
              createValidationError(
                "missing_widget",
                `File "${file.path}" imports widget "${resolvedPath}" which was not generated. Create the widget file or remove the import.`,
                "error",
                file.path,
              ),
            );
          } else if (
            !this.isPackageImport(importPath) &&
            resolvedPath.startsWith("lib/screens/")
          ) {
            // Screens importing other screens is discouraged
            if (file.path.startsWith("lib/screens/")) {
              warnings.push(
                createValidationError(
                  "screen_import_screen",
                  `Screen "${file.path}" imports another screen "${resolvedPath}". Screens should not import each other directly.`,
                  "warning",
                  file.path,
                ),
              );
            }
          }
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validates that screen files don't import forbidden files (router, main.dart)
   */
  private validateImports(files: ParsedFile[]): {
    errors: ValidationError[];
    warnings: ValidationError[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const file of files) {
      if (!file.path.startsWith("lib/screens/")) continue;

      for (const forbidden of FORBIDDEN_SCREEN_IMPORTS) {
        if (
          file.content.includes(`'${forbidden}'`) ||
          file.content.includes(`"${forbidden}"`)
        ) {
          errors.push(
            createValidationError(
              "forbidden_import",
              `Screen "${file.path}" imports "${forbidden}" which is not allowed. Screens should only import widgets and packages.`,
              "error",
              file.path,
            ),
          );
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validates that router additions import all generated screens
   */
  private validateRouterImportsComplete(
    routerAdditions: RouterAdditions,
    screenFiles: ParsedFile[],
  ): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Extract screen names from router imports
    const routerImportedScreens = new Set<string>();
    for (const imp of routerAdditions.imports) {
      const match = imp.match(/import\s+['"]\.\.\/screens\/(\w+)\.dart['"]/);
      if (match) {
        routerImportedScreens.add(match[1]);
      }
    }

    // Check each screen file has a corresponding router import
    for (const screenFile of screenFiles) {
      const fileName = screenFile.path.split("/").pop()?.replace(".dart", "");
      if (fileName && !routerImportedScreens.has(fileName)) {
        errors.push(
          createValidationError(
            "missing_router_import",
            `Screen "${screenFile.path}" is not imported in router additions. Add: import '../screens/${fileName}.dart';`,
            "error",
          ),
        );
      }
    }

    // Check router has route cases for imported screens
    if (
      routerAdditions.imports.length > 0 &&
      routerAdditions.routeCases.length === 0
    ) {
      errors.push(
        createValidationError(
          "missing_route_cases",
          "Router additions have imports but no route cases. Add case statements for each screen.",
          "error",
        ),
      );
    }

    return { errors, warnings };
  }

  /**
   * Resolves a relative import path to an absolute path
   */
  private resolveImportPath(
    fromFile: string,
    importPath: string,
  ): string | null {
    if (!importPath.startsWith("..") && !importPath.startsWith(".")) {
      return null; // Package import
    }

    const fromParts = fromFile.split("/");
    fromParts.pop(); // Remove filename

    const importParts = importPath.split("/");

    for (const part of importParts) {
      if (part === "..") {
        fromParts.pop();
      } else if (part !== ".") {
        fromParts.push(part);
      }
    }

    return fromParts.join("/");
  }

  /**
   * Checks if an import is a package import
   */
  private isPackageImport(importPath: string): boolean {
    return (
      importPath.startsWith("package:") ||
      ALWAYS_AVAILABLE_IMPORTS.some((p) => importPath.includes(p))
    );
  }

  /**
   * Performs basic Dart syntax validation
   */
  validateDartSyntax(file: ParsedFile): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const content = file.content;
    const lines = content.split("\n");

    let braceCount = 0;
    let parenCount = 0;
    let bracketCount = 0;

    for (const line of lines) {
      const cleanLine = this.removeStringsAndComments(line);

      braceCount += (cleanLine.match(/{/g) || []).length;
      braceCount -= (cleanLine.match(/}/g) || []).length;

      parenCount += (cleanLine.match(/\(/g) || []).length;
      parenCount -= (cleanLine.match(/\)/g) || []).length;

      bracketCount += (cleanLine.match(/\[/g) || []).length;
      bracketCount -= (cleanLine.match(/\]/g) || []).length;
    }

    if (braceCount !== 0) {
      errors.push(
        createValidationError(
          "syntax",
          `Unbalanced braces in ${file.path} (${braceCount > 0 ? "missing closing" : "extra closing"})`,
          "error",
          file.path,
        ),
      );
    }

    if (parenCount !== 0) {
      errors.push(
        createValidationError(
          "syntax",
          `Unbalanced parentheses in ${file.path} (${parenCount > 0 ? "missing closing" : "extra closing"})`,
          "error",
          file.path,
        ),
      );
    }

    if (bracketCount !== 0) {
      errors.push(
        createValidationError(
          "syntax",
          `Unbalanced brackets in ${file.path} (${bracketCount > 0 ? "missing closing" : "extra closing"})`,
          "error",
          file.path,
        ),
      );
    }

    // Check screen files have class definitions
    if (file.path.includes("screen") || file.path.includes("page")) {
      const classMatches = content.match(/class\s+\w+/g);
      if (!classMatches || classMatches.length === 0) {
        errors.push(
          createValidationError(
            "missing_class",
            `Screen file "${file.path}" has no class definition`,
            "error",
            file.path,
          ),
        );
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates file and class naming conventions
   */
  validateNamingConventions(
    file: ParsedFile,
    conventions: ArchitecturePlan["naming_conventions"],
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const fileName = file.path.split("/").pop() || file.path;

    if (file.path.endsWith(".dart")) {
      const fileNameWithoutExt = fileName.replace(".dart", "");

      if (conventions.files === "snake_case") {
        if (!this.isSnakeCase(fileNameWithoutExt)) {
          warnings.push(
            createValidationError(
              "naming_convention",
              `File name "${fileName}" should be snake_case`,
              "warning",
              file.path,
            ),
          );
        }
      }

      const classMatches = file.content.match(/class\s+(\w+)/g);
      if (classMatches) {
        for (const match of classMatches) {
          const className = match.replace("class ", "").trim();
          if (conventions.classes === "PascalCase") {
            if (!this.isPascalCase(className)) {
              warnings.push(
                createValidationError(
                  "naming_convention",
                  `Class name "${className}" should be PascalCase`,
                  "warning",
                  file.path,
                ),
              );
            }
          }
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Checks for TODO comments and placeholder code
   */
  checkForPlaceholders(file: ParsedFile): ValidationResult {
    const warnings: ValidationError[] = [];
    const lines = file.content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      if (/\/\/\s*TODO/i.test(line) || /\/\*\s*TODO/i.test(line)) {
        warnings.push(
          createValidationError(
            "incomplete",
            `TODO comment found in ${file.path}`,
            "warning",
            file.path,
            lineNum,
          ),
        );
      }

      if (/\/\/\s*FIXME/i.test(line)) {
        warnings.push(
          createValidationError(
            "incomplete",
            `FIXME comment found in ${file.path}`,
            "warning",
            file.path,
            lineNum,
          ),
        );
      }

      if (/placeholder|not implemented|coming soon/i.test(line)) {
        warnings.push(
          createValidationError(
            "incomplete",
            `Placeholder text detected in ${file.path}`,
            "warning",
            file.path,
            lineNum,
          ),
        );
      }

      if (/throw\s+UnimplementedError/i.test(line)) {
        warnings.push(
          createValidationError(
            "incomplete",
            `Unimplemented code detected in ${file.path}`,
            "warning",
            file.path,
            lineNum,
          ),
        );
      }
    }

    return { valid: true, errors: [], warnings };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private normalizePath(path: string): string {
    return path
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/\*+/g, "")
      .replace(/`/g, "")
      .trim();
  }

  private removeStringsAndComments(line: string): string {
    let result = line.replace(/\/\/.*$/, "");
    result = result.replace(/'[^']*'/g, "");
    result = result.replace(/"[^"]*"/g, "");
    return result;
  }

  private isSnakeCase(str: string): boolean {
    return /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(str);
  }

  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultParser: ResponseParser | null = null;

export function getResponseParser(): ResponseParser {
  if (!defaultParser) {
    defaultParser = new ResponseParser();
  }
  return defaultParser;
}

export function createResponseParser(): ResponseParser {
  return new ResponseParser();
}
