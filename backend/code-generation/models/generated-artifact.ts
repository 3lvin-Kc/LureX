import { z } from 'zod';

/**
 * Generated Artifact Model
 *
 * Represents metadata for a generated Flutter code file.
 * The actual file content is stored in Supabase Storage bucket,
 * while this model stores metadata in the database.
 */

// ============================================================================
// File Type Enum
// ============================================================================

export const FileTypeEnum = z.enum(['dart', 'yaml', 'json', 'md', 'txt']);
export type FileType = z.infer<typeof FileTypeEnum>;

// ============================================================================
// Generated Artifact Schema
// ============================================================================

export const GeneratedArtifactSchema = z.object({
  // Database identifiers
  id: z.string().uuid(),
  project_state_id: z.string().uuid(),
  identity_id: z.string().uuid(),
  architecture_plan_id: z.string().uuid(),

  // File metadata
  file_path: z.string().min(1),        // e.g., "lib/main.dart"
  file_name: z.string().min(1),        // e.g., "main.dart"
  storage_path: z.string().min(1),     // e.g., "projects/{id}/lib/main.dart"
  file_type: FileTypeEnum,
  file_size_bytes: z.number().int().nonnegative(),

  // File classification
  is_entry_point: z.boolean(),
  generation_order: z.number().int().nonnegative(),

  // Timestamps
  created_at: z.date(),
});

export type GeneratedArtifact = z.infer<typeof GeneratedArtifactSchema>;

// ============================================================================
// Input types (for creating new artifacts)
// ============================================================================

export const GeneratedArtifactInputSchema = z.object({
  project_state_id: z.string().uuid(),
  identity_id: z.string().uuid(),
  architecture_plan_id: z.string().uuid(),

  file_path: z.string().min(1),
  file_name: z.string().min(1),
  storage_path: z.string().min(1),
  file_type: FileTypeEnum,
  file_size_bytes: z.number().int().nonnegative(),

  is_entry_point: z.boolean().default(false),
  generation_order: z.number().int().nonnegative().default(0),
});

export type GeneratedArtifactInput = z.infer<typeof GeneratedArtifactInputSchema>;

// ============================================================================
// Parsed File (intermediate representation during generation)
// ============================================================================

export interface ParsedFile {
  path: string;           // Relative path, e.g., "lib/main.dart"
  content: string;        // Full file content
  isEntryPoint: boolean;  // True if this is main.dart
}

// ============================================================================
// Database Row Interface (for repository mapping)
// ============================================================================

export interface GeneratedArtifactRow {
  id: string;
  project_state_id: string;
  identity_id: string;
  architecture_plan_id: string;
  file_path: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  file_size_bytes: number;
  is_entry_point: boolean;
  generation_order: number;
  created_at: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts file name from a file path
 * e.g., "lib/screens/home_screen.dart" -> "home_screen.dart"
 */
export function extractFileName(filePath: string): string {
  const parts = filePath.split('/');
  return parts[parts.length - 1] || filePath;
}

/**
 * Determines file type from file extension
 */
export function determineFileType(filePath: string): FileType {
  const extension = filePath.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'dart':
      return 'dart';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'json':
      return 'json';
    case 'md':
      return 'md';
    default:
      return 'txt';
  }
}

/**
 * Checks if a file path represents the entry point
 */
export function isEntryPointFile(filePath: string): boolean {
  return filePath === 'lib/main.dart' || filePath === 'main.dart';
}

/**
 * Generates storage path for a file
 * Format: projects/{project_state_id}/{file_path}
 */
export function generateStoragePath(projectStateId: string, filePath: string): string {
  // Normalize path separators and remove leading slashes
  const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `projects/${projectStateId}/${normalizedPath}`;
}

/**
 * Creates a GeneratedArtifactInput from a parsed file
 */
export function createArtifactInput(
  parsedFile: ParsedFile,
  projectStateId: string,
  identityId: string,
  architecturePlanId: string,
  generationOrder: number
): GeneratedArtifactInput {
  const fileName = extractFileName(parsedFile.path);
  const fileType = determineFileType(parsedFile.path);
  const storagePath = generateStoragePath(projectStateId, parsedFile.path);
  const fileSizeBytes = Buffer.byteLength(parsedFile.content, 'utf8');

  return {
    project_state_id: projectStateId,
    identity_id: identityId,
    architecture_plan_id: architecturePlanId,
    file_path: parsedFile.path,
    file_name: fileName,
    storage_path: storagePath,
    file_type: fileType,
    file_size_bytes: fileSizeBytes,
    is_entry_point: parsedFile.isEntryPoint || isEntryPointFile(parsedFile.path),
    generation_order: generationOrder,
  };
}

/**
 * Maps a database row to a GeneratedArtifact object
 */
export function mapRowToArtifact(row: GeneratedArtifactRow): GeneratedArtifact {
  return {
    id: row.id,
    project_state_id: row.project_state_id,
    identity_id: row.identity_id,
    architecture_plan_id: row.architecture_plan_id,
    file_path: row.file_path,
    file_name: row.file_name,
    storage_path: row.storage_path,
    file_type: row.file_type as FileType,
    file_size_bytes: row.file_size_bytes,
    is_entry_point: row.is_entry_point,
    generation_order: row.generation_order,
    created_at: new Date(row.created_at),
  };
}
