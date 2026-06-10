import {
  CreateMaintenanceRequestInput,
  MaintenanceRequest,
  MaintenanceRequestStatus,
  PaginatedResult,
  TomarResponsabilidadInput,
} from '../models/maintenance-request.model';

export abstract class MaintenanceRequestRepository {
  abstract listByStatus(
    status: MaintenanceRequestStatus,
    offset: number,
    limit: number,
  ): Promise<PaginatedResult<MaintenanceRequest>>;

  abstract listByCreatedBy(
    createdBy: string,
    offset: number,
    limit: number,
  ): Promise<PaginatedResult<MaintenanceRequest>>;

  abstract getById(id: string): Promise<MaintenanceRequest>;

  abstract create(input: CreateMaintenanceRequestInput): Promise<MaintenanceRequest>;

  abstract tomarResponsabilidad(input: TomarResponsabilidadInput): Promise<void>;
}
