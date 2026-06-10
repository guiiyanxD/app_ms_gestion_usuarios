export type MaintenanceRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type MaintenanceTipo = 'CORRECTIVO' | 'PREVENTIVO';
export type MaintenancePrioridad = 'ALTA' | 'MEDIA' | 'BAJA';
export type MaintenanceType = 'CORRECTIVE' | 'PREVENTIVE';

export interface FixedAsset {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly location: string;
  readonly status?: string;
}

export interface StatusChangeLog {
  readonly fromStatus: string;
  readonly toStatus: string;
}

export interface MaintenanceRequest {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: MaintenanceRequestStatus;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly fixedAsset: FixedAsset;
  readonly statusChangeLog: readonly StatusChangeLog[];
}

export interface PaginatedResult<T> {
  readonly content: readonly T[];
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalElements: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

export interface CreateMaintenanceRequestInput {
  readonly fixedAssetId: string;
  readonly title: string;
  readonly description: string;
  readonly tipo: MaintenanceTipo;
  readonly prioridad: MaintenancePrioridad;
  readonly areaId: number;
  readonly solicitanteId: string;
}

export interface TomarResponsabilidadInput {
  readonly maintenanceRequestId: string;
  readonly type: MaintenanceType;
  readonly description: string;
  readonly userId: string;
  readonly imageUrl?: string;
}
