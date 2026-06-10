import { CreateMaintenanceRequestInput, MaintenanceRequest } from '../models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../repositories/maintenance-request.repository';

export class CreateRequestUseCase {
  constructor(private readonly repo: MaintenanceRequestRepository) {}

  execute(input: CreateMaintenanceRequestInput): Promise<MaintenanceRequest> {
    return this.repo.create(input);
  }
}
