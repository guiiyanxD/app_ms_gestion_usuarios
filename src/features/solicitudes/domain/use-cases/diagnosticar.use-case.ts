import { DiagnosticarInput } from '../models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../repositories/maintenance-request.repository';

export class DiagnosticarUseCase {
  constructor(private readonly repo: MaintenanceRequestRepository) {}
  execute(input: DiagnosticarInput): Promise<void> {
    return this.repo.diagnosticar(input);
  }
}
