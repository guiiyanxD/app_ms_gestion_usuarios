export interface FixedAssetDto {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly location: string;
  readonly status?: string;
}

export interface StatusChangeLogDto {
  readonly fromStatus: string;
  readonly toStatus: string;
}

export interface MaintenanceRequestDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly fixedAsset: FixedAssetDto;
  readonly statusChangeLog: readonly StatusChangeLogDto[];
}

export interface CreateSolicitudRestDto {
  readonly solicitante_id: string;
  readonly activo_id: string;
  readonly area_id: number;
  readonly tipo: 'CORRECTIVO' | 'PREVENTIVO';
  readonly prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  readonly descripcion: string;
  readonly canal_origen: 'MOVIL';
  readonly metadata: Record<string, unknown>;
}

export interface UpdateEstadoRestDto {
  readonly estado: 'EN_PROCESO';
  readonly tecnico_id: string;
  readonly diagnostico: string;
}
