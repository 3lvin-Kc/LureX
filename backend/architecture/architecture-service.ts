import { ProjectIdentity } from '../project-identity/model';
import { ArchitecturePlan } from './model';
import { ArchitectureRepository } from './repository';
import { ArchitectureDecisionEngine } from './engine';

export class ArchitectureService {
  constructor(private repository: ArchitectureRepository) {}

  async createArchitecturePlan(identity: ProjectIdentity): Promise<ArchitecturePlan> {
    const existingPlan = await this.repository.findByProjectIdentityId(identity.identity_id);
    if (existingPlan) {
      throw new Error('Architecture plan already exists for this project identity.');
    }

    const plan = ArchitectureDecisionEngine.generatePlan(identity);
    await this.repository.save(plan);
    return plan;
  }

  async getArchitecturePlan(project_identity_id: string): Promise<ArchitecturePlan | null> {
    return this.repository.findByProjectIdentityId(project_identity_id);
  }
}