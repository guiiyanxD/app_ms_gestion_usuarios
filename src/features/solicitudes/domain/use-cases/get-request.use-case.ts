import { MaintenanceRequest } from '../models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../repositories/maintenance-request.repository';

export class GetRequestUseCase {
  constructor(private readonly repo: MaintenanceRequestRepository) {}

  execute(id: string): Promise<MaintenanceRequest> {
    return this.repo.getById(id);
  }
}
