import {
  MaintenanceRequest,
  MaintenanceRequestStatus,
} from '../../domain/models/maintenance-request.model';
import { MaintenanceRequestDto } from '../dto/maintenance-request.dto';

export function toMaintenanceRequest(dto: MaintenanceRequestDto): MaintenanceRequest {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    status: dto.status as MaintenanceRequestStatus,
    createdBy: dto.createdBy,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    fixedAsset: {
      id: dto.fixedAsset.id,
      name: dto.fixedAsset.name,
      category: dto.fixedAsset.category,
      location: dto.fixedAsset.location,
      status: dto.fixedAsset.status,
    },
    statusChangeLog: dto.statusChangeLog.map((log) => ({
      fromStatus: log.fromStatus,
      toStatus: log.toStatus,
    })),
  };
}
