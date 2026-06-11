import {
  MaintenanceRequest,
  MaintenanceRequestStatus,
} from '../../domain/models/maintenance-request.model';
import { SolicitudDetailDto, SolicitudListItemDto } from '../dto/maintenance-request.dto';

const ESTADO_TO_STATUS: Record<string, MaintenanceRequestStatus> = {
  PENDIENTE: 'PENDING',
  EN_PROCESO: 'APPROVED',
  COMPLETADO: 'COMPLETED',
};

export const STATUS_TO_ESTADO: Record<string, string> = {
  PENDING: 'PENDIENTE',
  APPROVED: 'EN_PROCESO',
  COMPLETED: 'COMPLETADO',
};

function parseEstado(estado: string): MaintenanceRequestStatus {
  return ESTADO_TO_STATUS[estado] ?? 'PENDING';
}

function parseCosto(costo: string): number | null {
  const n = parseFloat(costo);
  return isNaN(n) || n === 0 ? null : n;
}

export function toMaintenanceRequestFromList(dto: SolicitudListItemDto): MaintenanceRequest {
  return {
    id: dto.id,
    codigo: dto.codigo,
    title: dto.activo_nombre,
    description: dto.descripcion,
    status: parseEstado(dto.estado),
    createdBy: dto.solicitante_nombre,
    createdAt: dto.fecha_solicitud,
    updatedAt: dto.fecha_solicitud,
    fixedAsset: {
      id: '',
      name: dto.activo_nombre,
      category: dto.activo_codigo,
      location: dto.area_nombre,
      status: undefined,
    },
    statusChangeLog: [],
    tecnicoId: null,
    diagnostico: null,
    solucion: null,
    costo: parseCosto(dto.costo),
  };
}

export function toMaintenanceRequestFromDetail(dto: SolicitudDetailDto): MaintenanceRequest {
  return {
    id: dto.id,
    codigo: dto.codigo,
    title: dto.activo_nombre ?? dto.codigo,
    description: dto.descripcion,
    status: parseEstado(dto.estado),
    createdBy: dto.solicitante_nombre ?? '',
    createdAt: dto.fecha_solicitud,
    updatedAt: dto.updated_at,
    fixedAsset: {
      id: dto.activo_id ?? '',
      name: dto.activo_nombre ?? '',
      category: dto.activo_codigo ?? '',
      location: dto.area_nombre ?? '',
      status: undefined,
    },
    statusChangeLog: [],
    tecnicoId: dto.tecnico_id ?? null,
    diagnostico: dto.diagnostico ?? null,
    solucion: dto.solucion ?? null,
    costo: parseCosto(dto.costo),
  };
}
