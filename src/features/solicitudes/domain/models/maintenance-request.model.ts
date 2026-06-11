export type MaintenanceRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type MaintenanceTipo = 'CORRECTIVO' | 'PREVENTIVO';
export type MaintenancePrioridad = 'ALTA' | 'MEDIA' | 'BAJA' | 'CRITICA';
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
  readonly codigo: string;
  readonly title: string;
  readonly description: string;
  readonly status: MaintenanceRequestStatus;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly fixedAsset: FixedAsset;
  readonly statusChangeLog: readonly StatusChangeLog[];
  readonly tecnicoId: string | null;
  readonly diagnostico: string | null;
  readonly solucion: string | null;
  readonly costo: number | null;
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
  readonly description: string;
  readonly tipo: MaintenanceTipo;
  readonly prioridad: MaintenancePrioridad;
  readonly areaId: number;
  readonly solicitanteId: string;
}

export interface TomarResponsabilidadInput {
  readonly maintenanceRequestId: string;
  readonly tecnicoRestId: string;
}

export interface DiagnosticarInput {
  readonly maintenanceRequestId: string;
  readonly diagnostico: string;
  readonly tecnicoRestId: string;
}

export interface CompletarInput {
  readonly maintenanceRequestId: string;
  readonly solucion: string;
  readonly costo?: number;
}
