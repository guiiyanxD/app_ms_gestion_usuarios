import { MaintenanceRequest, PaginatedResult } from '../models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../repositories/maintenance-request.repository';

const PAGE_SIZE = 20;

export class ListMyRequestsUseCase {
  constructor(private readonly repo: MaintenanceRequestRepository) {}

  execute(createdBy: string, page: number): Promise<PaginatedResult<MaintenanceRequest>> {
    return this.repo.listByCreatedBy(createdBy, page * PAGE_SIZE, PAGE_SIZE);
  }
}
