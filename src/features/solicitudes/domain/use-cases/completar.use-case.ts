import { CompletarInput } from '../models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../repositories/maintenance-request.repository';

export class CompletarUseCase {
  constructor(private readonly repo: MaintenanceRequestRepository) {}
  execute(input: CompletarInput): Promise<void> {
    return this.repo.completar(input);
  }
}
