import { TomarResponsabilidadInput } from '../models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../repositories/maintenance-request.repository';

export class TomarResponsabilidadUseCase {
  constructor(private readonly repo: MaintenanceRequestRepository) {}

  execute(input: TomarResponsabilidadInput): Promise<void> {
    return this.repo.tomarResponsabilidad(input);
  }
}
