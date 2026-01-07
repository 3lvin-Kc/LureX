import { v4 as uuidv4 } from 'uuid';
import { ProjectIdentity, ProjectIdentitySchema } from './model';
import { ProjectIdentityRepository } from './repository';

/**
 * Service for managing the Project Identity.
 * It handles the creation of the identity and ensures its immutability.
 */
export class ProjectIdentityService {
  constructor(private repository: ProjectIdentityRepository) {}

  /**
   * Creates a new project identity based on the initial user prompt.
   * This is the first cognitive act of Zero-to-One and happens before any other project artifacts are created.
   * @param userInput The initial user prompt.
   * @returns The newly created project identity.
   */
  async create(userInput: { purpose: string }): Promise<ProjectIdentity> {
    const identity: ProjectIdentity = {
      identity_id: uuidv4(),
      project_id: null,
      core_definition: {
        purpose: userInput.purpose,
        domain: 'Mobile Application',
        type: 'Flutter UI Platform',
      },
      characteristics: [],
      scope: {
        included: ['Android', 'iOS'],
        excluded: ['Web', 'Desktop', 'Backend Services', 'API Integrations', 'Database'],
        boundary_principles: 'This project is strictly a client-side Flutter application for mobile platforms. No backend, server-side logic, or external integrations will be considered.',
      },
      scale: {
        user_base: 'Unknown',
        data_volume: 'N/A',
        sophistication_level: 'Minimal',
      },
      architecture: {
        philosophy: 'Minimal, client-side only , ready to use ',
        patterns: ['Stateless UI', 'Local State Management'],
        constraints: ['No backend communication', 'No network requests', 'No database access'],
      },
      evolution: {
        likely_next: [],
        possible_later: [],
        unlikely_ever: ['Backend integration', 'Web support', 'Desktop support'],
      },
      technical_foundation: {
        stack: 'Flutter',
        structure: 'Feature-based',
        state_management: 'Provider',
      },
      created_at: new Date(),
      immutable: true,
    };

    const validationResult = ProjectIdentitySchema.safeParse(identity);
    if (!validationResult.success) {
      throw new Error(`Invalid project identity: ${validationResult.error.message}`);
    }

    await this.repository.save(identity);
    return identity;
  }

  /**
   * Retrieves a project identity by its ID.
   * @param identity_id The ID of the identity to retrieve.
   * @returns The project identity, or null if not found.
   */
  async getById(identity_id: string): Promise<ProjectIdentity | null> {
    return this.repository.findById(identity_id);
  }
}