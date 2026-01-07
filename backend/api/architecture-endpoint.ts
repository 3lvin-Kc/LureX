import { ArchitectureService } from '../architecture/architecture-service';
import { ProjectIdentityService } from '../project-identity/project-identity-service';
import { ProjectStateService } from '../project-state/project-state-service';

export class ArchitectureEndpoint {
  constructor(
    private architectureService: ArchitectureService,
    private projectIdentityService: ProjectIdentityService,
    private projectStateService: ProjectStateService
  ) {}

  async createPlan(identity_id: string, project_id: string | null) {
    const identity = await this.projectIdentityService.getById(identity_id);
    if (!identity) {
      throw new Error('Project identity not found.');
    }

    const plan = await this.architectureService.createArchitecturePlan(identity);

    if (project_id) {
        await this.projectStateService.updateProjectState(project_id, { architecture_plan_established: true });
    }

    return plan;
  }

  async getPlan(identity_id: string) {
    return this.architectureService.getArchitecturePlan(identity_id);
  }
}