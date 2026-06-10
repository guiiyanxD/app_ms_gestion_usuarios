import { MaintenanceRequest, PaginatedResult } from '../models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../repositories/maintenance-request.repository';

const PAGE_SIZE = 20;

export class ListPendingRequestsUseCase {
  constructor(private readonly repo: MaintenanceRequestRepository) {}

  execute(page: number): Promise<PaginatedResult<MaintenanceRequest>> {
    return this.repo.listByStatus('PENDING', page * PAGE_SIZE, PAGE_SIZE);
  }
}
