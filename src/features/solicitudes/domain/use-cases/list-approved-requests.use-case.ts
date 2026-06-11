import { MaintenanceRequest, PaginatedResult } from '../models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../repositories/maintenance-request.repository';

const PAGE_SIZE = 20;

export class ListByTecnicoUseCase {
  constructor(private readonly repo: MaintenanceRequestRepository) {}
  execute(tecnicoId: string, page: number): Promise<PaginatedResult<MaintenanceRequest>> {
    return this.repo.listByTecnicoId(tecnicoId, page * PAGE_SIZE, PAGE_SIZE);
  }
}
