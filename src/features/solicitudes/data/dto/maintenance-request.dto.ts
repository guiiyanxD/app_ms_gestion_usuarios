// ── REST list item (GET /solicitudes?estado=...) ─────────────────────────────
export interface SolicitudListItemDto {
  readonly id: string;
  readonly codigo: string;
  readonly estado: string;
  readonly tipo: string;
  readonly prioridad: string;
  readonly descripcion: string;
  readonly fecha_solicitud: string;
  readonly fecha_inicio: string | null;
  readonly fecha_fin: string | null;
  readonly costo: string;
  readonly solicitante_nombre: string;
  readonly tecnico_nombre: string | null;
  readonly activo_codigo: string;
  readonly activo_nombre: string;
  readonly area_nombre: string;
}

export interface SolicitudListResponseDto {
  readonly success: boolean;
  readonly data: SolicitudListItemDto[];
  readonly meta: {
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
  };
}

// ── REST detail (GET /solicitudes/:id) ───────────────────────────────────────
export interface SolicitudDetailDto {
  readonly id: string;
  readonly codigo: string;
  readonly solicitante_id: string | null;
  readonly tecnico_id: string | null;
  readonly activo_id: string | null;
  readonly area_id: number | null;
  readonly tipo: string;
  readonly prioridad: string;
  readonly estado: string;
  readonly descripcion: string;
  readonly diagnostico: string | null;
  readonly solucion: string | null;
  readonly costo: string;
  readonly fecha_solicitud: string;
  readonly fecha_inicio: string | null;
  readonly fecha_fin: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly solicitante_nombre: string | null;
  readonly tecnico_nombre: string | null;
  readonly activo_codigo: string | null;
  readonly activo_nombre: string | null;
  readonly area_nombre: string | null;
}

export interface SolicitudDetailResponseDto {
  readonly success: boolean;
  readonly data: SolicitudDetailDto;
}

export interface CreateSolicitudRestDto {
  readonly solicitante_id: string;
  readonly activo_id: string;
  readonly area_id: number;
  readonly tipo: 'CORRECTIVO' | 'PREVENTIVO';
  readonly prioridad: 'ALTA' | 'MEDIA' | 'BAJA' | 'CRITICA';
  readonly descripcion: string;
  readonly canal_origen: 'WEB' | 'TELEGRAM' | 'EMAIL' | 'APP_MOVIL';
  readonly metadata: Record<string, unknown>;
}

export interface TomarResponsabilidadRestDto {
  readonly estado: 'EN_PROCESO';
  readonly tecnico_id: string;
}

export interface DiagnosticarRestDto {
  readonly estado: 'EN_PROCESO';
  readonly tecnico_id: string;
  readonly diagnostico: string;
}

export interface CompletarRestDto {
  readonly estado: 'COMPLETADO';
  readonly solucion: string;
  readonly costo?: number;
}
