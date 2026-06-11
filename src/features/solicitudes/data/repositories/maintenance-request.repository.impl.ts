import { axiosClient } from '../../../../core/api/axios.client';
import '../../../../core/api/axios.interceptor';
import {
  CompletarInput,
  CreateMaintenanceRequestInput,
  DiagnosticarInput,
  MaintenanceRequest,
  MaintenanceRequestStatus,
  PaginatedResult,
  TomarResponsabilidadInput,
} from '../../domain/models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../../domain/repositories/maintenance-request.repository';
import {
  CompletarRestDto,
  CreateSolicitudRestDto,
  DiagnosticarRestDto,
  SolicitudDetailResponseDto,
  SolicitudListResponseDto,
  TomarResponsabilidadRestDto,
} from '../dto/maintenance-request.dto';
import {
  STATUS_TO_ESTADO,
  toMaintenanceRequestFromDetail,
  toMaintenanceRequestFromList,
} from '../mappers/maintenance-request.mapper';

const PAGE_SIZE_DEFAULT = 20;

function toPaginatedResult<T>(
  data: T[],
  meta: { total: number; page: number; pageSize: number; totalPages: number },
): PaginatedResult<T> {
  return {
    content: data,
    currentPage: meta.page - 1,
    totalPages: meta.totalPages,
    totalElements: meta.total,
    hasNext: meta.page < meta.totalPages,
    hasPrevious: meta.page > 1,
  };
}

export class MaintenanceRequestRepositoryImpl extends MaintenanceRequestRepository {

  // ── Lecturas REST ─────────────────────────────────────────────────────────

  async listByStatus(
    status: MaintenanceRequestStatus,
    offset: number,
    limit: number,
  ): Promise<PaginatedResult<MaintenanceRequest>> {
    const estado = STATUS_TO_ESTADO[status];
    const page = Math.floor(offset / limit) + 1;
    const { data } = await axiosClient.get<SolicitudListResponseDto>('/solicitudes', {
      params: { estado, page, pageSize: limit },
    });
    return toPaginatedResult(data.data.map(toMaintenanceRequestFromList), data.meta);
  }

  async listByCreatedBy(
    solicitanteId: string,
    offset: number,
    limit: number,
  ): Promise<PaginatedResult<MaintenanceRequest>> {
    const page = Math.floor(offset / limit) + 1;
    const { data } = await axiosClient.get<SolicitudListResponseDto>('/solicitudes', {
      params: { solicitanteId, page, pageSize: limit },
    });
    return toPaginatedResult(data.data.map(toMaintenanceRequestFromList), data.meta);
  }

  async listByTecnicoId(
    tecnicoId: string,
    offset: number,
    limit: number,
  ): Promise<PaginatedResult<MaintenanceRequest>> {
    const page = Math.floor(offset / limit) + 1;
    const { data } = await axiosClient.get<SolicitudListResponseDto>('/solicitudes', {
      params: { tecnicoId, page, pageSize: limit },
    });
    return toPaginatedResult(data.data.map(toMaintenanceRequestFromList), data.meta);
  }

  async getById(id: string): Promise<MaintenanceRequest> {
    const { data } = await axiosClient.get<SolicitudDetailResponseDto>(`/solicitudes/${id}`);
    return toMaintenanceRequestFromDetail(data.data);
  }

  // ── Escrituras REST ───────────────────────────────────────────────────────

  async create(input: CreateMaintenanceRequestInput): Promise<MaintenanceRequest> {
    const restDto: CreateSolicitudRestDto = {
      solicitante_id: input.solicitanteId,
      activo_id: input.fixedAssetId,
      area_id: input.areaId,
      tipo: input.tipo,
      prioridad: input.prioridad,
      descripcion: input.description,
      canal_origen: 'APP_MOVIL',
      metadata: {},
    };

    console.log('[create] body enviado:', JSON.stringify(restDto, null, 2));

    try {
      const { data } = await axiosClient.post<SolicitudDetailResponseDto>('/solicitudes', restDto);
      return toMaintenanceRequestFromDetail(data.data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: unknown } };
        console.log('[create] HTTP', axiosErr.response?.status, JSON.stringify(axiosErr.response?.data, null, 2));
      }
      throw err;
    }
  }

  async tomarResponsabilidad(input: TomarResponsabilidadInput): Promise<void> {
    const restDto: TomarResponsabilidadRestDto = {
      estado: 'EN_PROCESO',
      tecnico_id: input.tecnicoRestId,
    };

    console.log('[tomarResponsabilidad] body enviado:', JSON.stringify(restDto, null, 2));

    try {
      await axiosClient.patch(`/solicitudes/${input.maintenanceRequestId}/estado`, restDto);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: unknown } };
        console.log('[tomarResponsabilidad] HTTP', axiosErr.response?.status, JSON.stringify(axiosErr.response?.data, null, 2));
      }
      throw err;
    }
  }

  async diagnosticar(input: DiagnosticarInput): Promise<void> {
    const restDto: DiagnosticarRestDto = {
      estado: 'EN_PROCESO',
      tecnico_id: input.tecnicoRestId,
      diagnostico: input.diagnostico,
    };

    console.log('[diagnosticar] body enviado:', JSON.stringify(restDto, null, 2));

    try {
      await axiosClient.patch(`/solicitudes/${input.maintenanceRequestId}/estado`, restDto);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: unknown } };
        console.log('[diagnosticar] HTTP', axiosErr.response?.status, JSON.stringify(axiosErr.response?.data, null, 2));
      }
      throw err;
    }
  }

  async completar(input: CompletarInput): Promise<void> {
    const restDto: CompletarRestDto = {
      estado: 'COMPLETADO',
      solucion: input.solucion,
      ...(input.costo !== undefined && { costo: input.costo }),
    };
    await axiosClient.patch(`/solicitudes/${input.maintenanceRequestId}/estado`, restDto);
  }
}
