/**
 * Main entry point for the backend system implementing Zero-to-One Mode Detection & Hard Boundary Layer
 *
 * This file represents the backend core that executes before any AI reasoning,
 * prompt construction, or code generation, and hard-gates which downstream pipeline is allowed to run.
 *
 * The implementation includes:
 * 1. Project State Model (Persistent)
 * 2. Atomic Mode Detection Rule
 * 3. Irreversible Mode Transition Logic
 * 4. Mode Gatekeeper Layer
 * 5. Destructive User Language Handling
 */

// This is the main entry point for the backend services.
// It initializes and exports all the necessary services and endpoints.

import { Mode, ProjectState, ProjectStateSchema } from "./project-state/model";
import { ModeDetector } from "./project-state/mode-detector";
import { ModeGatekeeper } from "./project-state/mode-gatekeeper";
import { ModeTransitionManager } from "./project-state/mode-transition-manager";
import { ProjectStateRepository } from "./project-state/repository";
import { ProjectStateService } from "./project-state/project-state-service";
import { ProjectStateEndpoint } from "./api/project-state-endpoint";

import {
  ProjectIdentity,
  ProjectIdentitySchema,
} from "./project-identity/model";
import { ProjectIdentityRepository } from "./project-identity/repository";
import { ProjectIdentityService } from "./project-identity/project-identity-service";
import { ProjectIdentityEndpoint } from "./api/project-identity-endpoint";
import { ArchitectureEndpoint } from "./api/architecture-endpoint";

import { ArchitectureRepository } from "./architecture/repository";
import { ArchitectureService } from "./architecture/architecture-service";

// Export core models and types
export {
  Mode,
  ProjectState,
  ProjectStateSchema,
  ProjectIdentity,
  ProjectIdentitySchema,
};

// Export core services and detectors
export {
  ModeDetector,
  ModeGatekeeper,
  ModeTransitionManager,
  ProjectStateService,
  ProjectIdentityService,
  ArchitectureService,
};

// Export API endpoints
export { ProjectStateEndpoint, ProjectIdentityEndpoint, ArchitectureEndpoint };

// Initialize repositories
const projectStateRepository = new ProjectStateRepository();
const projectIdentityRepository = new ProjectIdentityRepository();
const architectureRepository = new ArchitectureRepository();

// Initialize services
export const projectStateService = new ProjectStateService(
  projectStateRepository,
);
export const projectIdentityService = new ProjectIdentityService(
  projectIdentityRepository,
);
export const architectureService = new ArchitectureService(
  architectureRepository,
);

// Initialize API endpoint handlers
export const projectStateEndpoint = new ProjectStateEndpoint(
  projectStateService,
);
export const projectIdentityEndpoint = new ProjectIdentityEndpoint(
  projectIdentityService,
);
export const architectureEndpoint = new ArchitectureEndpoint(
  architectureService,
  projectIdentityService,
  projectStateService,
);

console.log("✅ Zero-to-One Mode Detection & Hard Boundary Layer initialized");
console.log("   - Project State Model: Ready");
console.log("   - Project Identity Model: Ready");
console.log("   - Atomic Mode Detection: Active");
console.log("   - Mode Transition Manager: Running");
console.log("   - Gatekeeper Layer: Enforcing boundaries");
console.log("   - Destructive Language Detection: Active");

/**
 * The main function that would be called when a request arrives
 * This implements the exact flow specified in the requirements:
 *
 * Request arrives
 *   ↓
 * Load project state
 *   ↓
 * Run atomic mode detection
 *   ↓
 * IF ZERO_TO_ONE:
 *   route → Zero-to-One Pipeline
 * ELSE:
 *   route → One-to-N Pipeline
 */
export async function handleIncomingRequest(
  projectId: string | null,
  userInput: string,
  isZeroToOneRequest: boolean,
): Promise<{
  mode: "ZERO_TO_ONE" | "ONE_TO_N";
  allowed: boolean;
  reason?: string;
  projectState: ProjectState;
}> {
  return await projectStateService.executeGatekeeping(
    projectId,
    userInput,
    isZeroToOneRequest,
  );
}

/**
 * Export the main service functions for use in the backend
 */
export default {
  service: projectStateService,
  endpoint: projectStateEndpoint,
  handleIncomingRequest,
};
