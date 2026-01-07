/**
 * Streaming Parser Service
 *
 * A state machine-based parser that processes LLM output chunks in real-time.
 * Detects narration blocks, router additions, and file content as they stream.
 *
 * This enables the Lovable-style UI experience where:
 * - Narration appears as the AI "thinks"
 * - Files appear in the tree as they start
 * - Code streams with typewriter effect
 */

import { DELIMITERS } from "./base-structure-template";

// ============================================================================
// Types
// ============================================================================

export enum ParserState {
  IDLE = "IDLE",
  IN_NARRATION = "IN_NARRATION",
  IN_ROUTER_ADDITIONS = "IN_ROUTER_ADDITIONS",
  IN_FILE_START = "IN_FILE_START",
  IN_FILE_PATH = "IN_FILE_PATH",
  IN_FILE_CONTENT = "IN_FILE_CONTENT",
}

export type ParseEventType =
  | "narration"
  | "plan"
  | "router_additions"
  | "file_start"
  | "code_chunk"
  | "file_complete"
  | "parse_error";

export interface NarrationEvent {
  type: "narration";
  message: string;
  timestamp: Date;
}

export interface PlanEvent {
  type: "plan";
  screens: string[];
  widgets: string[];
}

export interface RouterAdditionsEvent {
  type: "router_additions";
  imports: string[];
  routes: string[];
  cases: string[];
}

export interface FileStartEvent {
  type: "file_start";
  path: string;
  index: number;
  total: number;
}

export interface CodeChunkEvent {
  type: "code_chunk";
  path: string;
  content: string;
  chunkIndex: number;
}

export interface FileCompleteEvent {
  type: "file_complete";
  path: string;
  content: string;
  size: number;
}

export interface ParseErrorEvent {
  type: "parse_error";
  message: string;
  state: ParserState;
  buffer: string;
}

export type ParseEvent =
  | NarrationEvent
  | PlanEvent
  | RouterAdditionsEvent
  | FileStartEvent
  | CodeChunkEvent
  | FileCompleteEvent
  | ParseErrorEvent;

// ============================================================================
// Markers
// ============================================================================

const MARKERS = {
  NARRATION_START: "<<<NARRATION>>>",
  NARRATION_END: "<<<END_NARRATION>>>",
  ROUTER_START: "<<<ROUTER_ADDITIONS>>>",
  ROUTER_END: "<<<END_ROUTER_ADDITIONS>>>",
  FILE_START: DELIMITERS.FILE_START, // <<<FILE_START>>>
  FILE_PATH: DELIMITERS.FILE_PATH, // <<<PATH>>>
  FILE_CONTENT: DELIMITERS.FILE_CONTENT, // <<<CONTENT>>>
  FILE_END: DELIMITERS.FILE_END, // <<<FILE_END>>>
} as const;

// ============================================================================
// Streaming Parser Class
// ============================================================================

export class StreamingParser {
  private state: ParserState = ParserState.IDLE;
  private buffer: string = "";

  // Current file being parsed
  private currentFilePath: string = "";
  private currentFileContent: string = "";
  private currentFileChunkIndex: number = 0;

  // Track all files for indexing
  private fileIndex: number = 0;
  private totalFilesEstimate: number = 0;
  private detectedFiles: string[] = [];

  // Router additions accumulator
  private routerAdditions: {
    imports: string[];
    routeConstants: string[];
    routeCases: string[];
  } = {
    imports: [],
    routeConstants: [],
    routeCases: [],
  };

  // Chunk emission settings
  private readonly MIN_CHUNK_SIZE = 20; // Minimum chars before emitting a code chunk
  private pendingContent: string = "";

  /**
   * Sets the estimated total number of files (from architecture plan)
   */
  setTotalFilesEstimate(count: number): void {
    this.totalFilesEstimate = count;
  }

  /**
   * Resets the parser to initial state
   */
  reset(): void {
    this.state = ParserState.IDLE;
    this.buffer = "";
    this.currentFilePath = "";
    this.currentFileContent = "";
    this.currentFileChunkIndex = 0;
    this.fileIndex = 0;
    this.detectedFiles = [];
    this.routerAdditions = { imports: [], routeConstants: [], routeCases: [] };
    this.pendingContent = "";
  }

  /**
   * Get current parser state (for debugging)
   */
  getState(): {
    state: ParserState;
    bufferLength: number;
    currentFile: string | null;
    filesDetected: number;
  } {
    return {
      state: this.state,
      bufferLength: this.buffer.length,
      currentFile: this.currentFilePath || null,
      filesDetected: this.detectedFiles.length,
    };
  }

  /**
   * Process an incoming chunk from the LLM stream.
   * Returns an array of parse events detected in this chunk.
   */
  processChunk(chunk: string): ParseEvent[] {
    this.buffer += chunk;
    const events: ParseEvent[] = [];

    // Keep processing until no more complete events can be extracted
    let safetyCounter = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (safetyCounter < maxIterations) {
      safetyCounter++;
      const event = this.tryExtractEvent();

      if (event) {
        events.push(event);
      } else {
        break;
      }
    }

    // If we're in file content state, emit pending content as chunks
    if (this.state === ParserState.IN_FILE_CONTENT) {
      const chunkEvents = this.emitPendingContent();
      events.push(...chunkEvents);
    }

    return events;
  }

  /**
   * Flush any remaining content (call when stream ends)
   */
  flush(): ParseEvent[] {
    const events: ParseEvent[] = [];

    // Emit any remaining pending content
    if (this.pendingContent.length > 0 && this.currentFilePath) {
      events.push({
        type: "code_chunk",
        path: this.currentFilePath,
        content: this.pendingContent,
        chunkIndex: this.currentFileChunkIndex++,
      });
      this.currentFileContent += this.pendingContent;
      this.pendingContent = "";
    }

    // If we were in the middle of a file, complete it
    if (
      this.state === ParserState.IN_FILE_CONTENT &&
      this.currentFilePath &&
      this.currentFileContent
    ) {
      events.push({
        type: "file_complete",
        path: this.currentFilePath,
        content: this.currentFileContent,
        size: this.currentFileContent.length,
      });
    }

    return events;
  }

  /**
   * Get the accumulated router additions
   */
  getRouterAdditions(): {
    imports: string[];
    routeConstants: string[];
    routeCases: string[];
  } {
    return { ...this.routerAdditions };
  }

  /**
   * Try to extract a single event from the buffer based on current state
   */
  private tryExtractEvent(): ParseEvent | null {
    switch (this.state) {
      case ParserState.IDLE:
        return this.handleIdleState();

      case ParserState.IN_NARRATION:
        return this.handleNarrationState();

      case ParserState.IN_ROUTER_ADDITIONS:
        return this.handleRouterAdditionsState();

      case ParserState.IN_FILE_START:
        return this.handleFileStartState();

      case ParserState.IN_FILE_PATH:
        return this.handleFilePathState();

      case ParserState.IN_FILE_CONTENT:
        return this.handleFileContentState();

      default:
        return null;
    }
  }

  /**
   * IDLE state: Looking for any marker to start a new section
   */
  private handleIdleState(): ParseEvent | null {
    // Check for narration
    const narrationIdx = this.buffer.indexOf(MARKERS.NARRATION_START);
    if (narrationIdx !== -1) {
      this.buffer = this.buffer.substring(
        narrationIdx + MARKERS.NARRATION_START.length
      );
      this.state = ParserState.IN_NARRATION;
      return null; // Wait for narration content
    }

    // Check for router additions
    const routerIdx = this.buffer.indexOf(MARKERS.ROUTER_START);
    if (routerIdx !== -1) {
      this.buffer = this.buffer.substring(
        routerIdx + MARKERS.ROUTER_START.length
      );
      this.state = ParserState.IN_ROUTER_ADDITIONS;
      return null;
    }

    // Check for file start
    const fileStartIdx = this.buffer.indexOf(MARKERS.FILE_START);
    if (fileStartIdx !== -1) {
      this.buffer = this.buffer.substring(
        fileStartIdx + MARKERS.FILE_START.length
      );
      this.state = ParserState.IN_FILE_START;
      return null;
    }

    // If buffer is getting too large without any markers, trim it
    // (This handles cases where LLM outputs explanatory text we don't need)
    if (this.buffer.length > 5000) {
      // Keep last 1000 chars in case a marker is split
      this.buffer = this.buffer.substring(this.buffer.length - 1000);
    }

    return null;
  }

  /**
   * IN_NARRATION state: Accumulating narration text until end marker
   */
  private handleNarrationState(): ParseEvent | null {
    const endIdx = this.buffer.indexOf(MARKERS.NARRATION_END);

    if (endIdx !== -1) {
      const narrationText = this.buffer.substring(0, endIdx).trim();
      this.buffer = this.buffer.substring(
        endIdx + MARKERS.NARRATION_END.length
      );
      this.state = ParserState.IDLE;

      if (narrationText.length > 0) {
        return {
          type: "narration",
          message: narrationText,
          timestamp: new Date(),
        };
      }
    }

    return null;
  }

  /**
   * IN_ROUTER_ADDITIONS state: Parse router additions section
   */
  private handleRouterAdditionsState(): ParseEvent | null {
    const endIdx = this.buffer.indexOf(MARKERS.ROUTER_END);

    if (endIdx !== -1) {
      const routerContent = this.buffer.substring(0, endIdx);
      this.buffer = this.buffer.substring(endIdx + MARKERS.ROUTER_END.length);
      this.state = ParserState.IDLE;

      // Parse the router additions content
      this.parseRouterAdditionsContent(routerContent);

      // Try to extract plan from router additions
      const planEvent = this.extractPlanFromRouter();

      return {
        type: "router_additions",
        imports: this.routerAdditions.imports,
        routes: this.routerAdditions.routeConstants,
        cases: this.routerAdditions.routeCases,
      };
    }

    return null;
  }

  /**
   * IN_FILE_START state: Waiting for PATH marker
   */
  private handleFileStartState(): ParseEvent | null {
    const pathIdx = this.buffer.indexOf(MARKERS.FILE_PATH);

    if (pathIdx !== -1) {
      this.buffer = this.buffer.substring(pathIdx + MARKERS.FILE_PATH.length);
      this.state = ParserState.IN_FILE_PATH;
    }

    return null;
  }

  /**
   * IN_FILE_PATH state: Extract file path
   */
  private handleFilePathState(): ParseEvent | null {
    // Look for CONTENT marker or newline to get the path
    const contentIdx = this.buffer.indexOf(MARKERS.FILE_CONTENT);
    const newlineIdx = this.buffer.indexOf("\n");

    if (newlineIdx !== -1 || contentIdx !== -1) {
      let pathEndIdx: number;

      if (contentIdx !== -1 && (newlineIdx === -1 || contentIdx < newlineIdx)) {
        // CONTENT marker comes first
        pathEndIdx = contentIdx;
        this.currentFilePath = this.normalizePath(
          this.buffer.substring(0, pathEndIdx).trim()
        );
        this.buffer = this.buffer.substring(
          contentIdx + MARKERS.FILE_CONTENT.length
        );
      } else if (newlineIdx !== -1) {
        // Newline comes first - path is on this line
        const potentialPath = this.buffer.substring(0, newlineIdx).trim();

        // Check if this looks like a valid path
        if (potentialPath.match(/^lib\/[\w\/\._-]+\.dart$/)) {
          this.currentFilePath = this.normalizePath(potentialPath);
          this.buffer = this.buffer.substring(newlineIdx + 1);

          // Now look for CONTENT marker
          const nextContentIdx = this.buffer.indexOf(MARKERS.FILE_CONTENT);
          if (nextContentIdx !== -1) {
            this.buffer = this.buffer.substring(
              nextContentIdx + MARKERS.FILE_CONTENT.length
            );
          }
        } else {
          // Not a path, keep looking
          this.buffer = this.buffer.substring(newlineIdx + 1);
          return null;
        }
      } else {
        return null;
      }

      if (this.currentFilePath) {
        this.state = ParserState.IN_FILE_CONTENT;
        this.currentFileContent = "";
        this.currentFileChunkIndex = 0;
        this.pendingContent = "";
        this.fileIndex++;
        this.detectedFiles.push(this.currentFilePath);

        return {
          type: "file_start",
          path: this.currentFilePath,
          index: this.fileIndex,
          total: this.totalFilesEstimate || this.fileIndex,
        };
      }
    }

    return null;
  }

  /**
   * IN_FILE_CONTENT state: Accumulate file content until FILE_END
   */
  private handleFileContentState(): ParseEvent | null {
    const endIdx = this.buffer.indexOf(MARKERS.FILE_END);

    if (endIdx !== -1) {
      // Get any remaining content before the end marker
      const remainingContent = this.buffer.substring(0, endIdx);
      this.pendingContent += remainingContent;

      // Emit final chunk if any
      if (this.pendingContent.length > 0) {
        this.currentFileContent += this.pendingContent;
      }

      this.buffer = this.buffer.substring(endIdx + MARKERS.FILE_END.length);
      this.state = ParserState.IDLE;

      const completedPath = this.currentFilePath;
      const completedContent = this.currentFileContent;

      // Reset file state
      this.currentFilePath = "";
      this.currentFileContent = "";
      this.pendingContent = "";

      return {
        type: "file_complete",
        path: completedPath,
        content: completedContent,
        size: completedContent.length,
      };
    } else {
      // No end marker yet, accumulate content
      // Move buffer content to pending (keeping some in case marker is split)
      const safeLength = Math.max(
        0,
        this.buffer.length - MARKERS.FILE_END.length
      );
      if (safeLength > 0) {
        this.pendingContent += this.buffer.substring(0, safeLength);
        this.buffer = this.buffer.substring(safeLength);
      }
    }

    return null;
  }

  /**
   * Emit pending content as code chunks
   */
  private emitPendingContent(): ParseEvent[] {
    const events: ParseEvent[] = [];

    while (this.pendingContent.length >= this.MIN_CHUNK_SIZE) {
      // Find a good break point (newline or end of statement)
      let breakPoint = this.findBreakPoint(
        this.pendingContent,
        this.MIN_CHUNK_SIZE
      );

      if (breakPoint === -1) {
        breakPoint = this.MIN_CHUNK_SIZE;
      }

      const chunk = this.pendingContent.substring(0, breakPoint);
      this.pendingContent = this.pendingContent.substring(breakPoint);
      this.currentFileContent += chunk;

      events.push({
        type: "code_chunk",
        path: this.currentFilePath,
        content: chunk,
        chunkIndex: this.currentFileChunkIndex++,
      });
    }

    return events;
  }

  /**
   * Find a good break point in content (prefer newlines, semicolons)
   */
  private findBreakPoint(content: string, minLength: number): number {
    // Look for newline after minLength
    const newlineIdx = content.indexOf("\n", minLength);
    if (newlineIdx !== -1 && newlineIdx < minLength * 2) {
      return newlineIdx + 1;
    }

    // Look for semicolon
    const semicolonIdx = content.indexOf(";", minLength);
    if (semicolonIdx !== -1 && semicolonIdx < minLength * 2) {
      return semicolonIdx + 1;
    }

    // Look for closing brace
    const braceIdx = content.indexOf("}", minLength);
    if (braceIdx !== -1 && braceIdx < minLength * 2) {
      return braceIdx + 1;
    }

    return -1;
  }

  /**
   * Parse router additions content into structured data
   */
  private parseRouterAdditionsContent(content: string): void {
    // Parse IMPORTS section
    const importsMatch = content.match(/IMPORTS:\s*([\s\S]*?)(?=ROUTES:|$)/i);
    if (importsMatch) {
      this.routerAdditions.imports = importsMatch[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("import "));
    }

    // Parse ROUTES section
    const routesMatch = content.match(/ROUTES:\s*([\s\S]*?)(?=CASES:|$)/i);
    if (routesMatch) {
      this.routerAdditions.routeConstants = routesMatch[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("static const"));
    }

    // Parse CASES section
    const casesMatch = content.match(/CASES:\s*([\s\S]*?)$/i);
    if (casesMatch) {
      const casesContent = casesMatch[1];
      const casePattern = /case\s+\w+:[\s\S]*?(?=case\s+\w+:|$)/g;
      const cases = casesContent.match(casePattern);
      if (cases) {
        this.routerAdditions.routeCases = cases.map((c) => c.trim());
      }
    }
  }

  /**
   * Extract screen/widget plan from router additions
   */
  private extractPlanFromRouter(): PlanEvent | null {
    const screens: string[] = [];
    const widgets: string[] = [];

    for (const imp of this.routerAdditions.imports) {
      // Extract file name from import
      const match = imp.match(/import\s+['"]\.\.\/(\w+)\/(\w+)\.dart['"]/);
      if (match) {
        const folder = match[1];
        const fileName = match[2];

        if (folder === "screens") {
          screens.push(fileName);
        } else if (folder === "widgets") {
          widgets.push(fileName);
        }
      }
    }

    if (screens.length > 0 || widgets.length > 0) {
      // Update total files estimate
      this.totalFilesEstimate = screens.length + widgets.length;

      return {
        type: "plan",
        screens,
        widgets,
      };
    }

    return null;
  }

  /**
   * Normalize a file path
   */
  private normalizePath(path: string): string {
    return path
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/\*+/g, "")
      .replace(/`/g, "")
      .replace(/\*\*/g, "")
      .trim();
  }
}

// ============================================================================
// Singleton
// ============================================================================

let defaultParser: StreamingParser | null = null;

export function getStreamingParser(): StreamingParser {
  if (!defaultParser) {
    defaultParser = new StreamingParser();
  }
  return defaultParser;
}

export function createStreamingParser(): StreamingParser {
  return new StreamingParser();
}
