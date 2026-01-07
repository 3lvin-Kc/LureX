import { ProjectIdentityService } from '../project-identity/project-identity-service';
import { ProjectIdentityRepository } from '../project-identity/repository';

/**
 * The API endpoint for managing the Project Identity.
 * It provides methods for creating and retrieving the identity.
 */
export class ProjectIdentityEndpoint {
  constructor(private service: ProjectIdentityService) {}

  static createDefault(): ProjectIdentityEndpoint {
    return new ProjectIdentityEndpoint(new ProjectIdentityService(new ProjectIdentityRepository()));
  }

  /**
   * Creates a new project identity.
   * @param userInput The initial user prompt.
   * @returns The newly created project identity.
   */
  async create(userInput: { purpose: string }) {
    return this.service.create(userInput);
  }

  /**
   * Retrieves a project identity by its ID.
   * @param identity_id The ID of the identity to retrieve.
   * @returns The project identity, or null if not found.
   */
  async getById(identity_id: string) {
    return this.service.getById(identity_id);
  }
}