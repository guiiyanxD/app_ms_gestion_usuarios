import { gql } from '@apollo/client';
import { apolloClient } from '../../../../core/api/apollo.client';
import { axiosClient } from '../../../../core/api/axios.client';
import '../../../../core/api/axios.interceptor';
import {
  CreateMaintenanceRequestInput,
  MaintenanceRequest,
  MaintenanceRequestStatus,
  PaginatedResult,
  TomarResponsabilidadInput,
} from '../../domain/models/maintenance-request.model';
import { MaintenanceRequestRepository } from '../../domain/repositories/maintenance-request.repository';
import {
  CreateSolicitudRestDto,
  MaintenanceRequestDto,
  UpdateEstadoRestDto,
} from '../dto/maintenance-request.dto';
import { toMaintenanceRequest } from '../mappers/maintenance-request.mapper';

const REQUEST_FRAGMENT = `
  id title description status createdBy createdAt updatedAt
  fixedAsset { id name category location status }
  statusChangeLog { fromStatus toStatus }
`;

const GET_BY_STATUS = gql`
  query GetMaintenanceRequestsByStatus($status: MaintenanceRequestStatusEnum!, $offset: Int!, $limit: Int!) {
    getMaintenanceRequestsByStatus(status: $status, offset: $offset, limit: $limit) {
      content { ${REQUEST_FRAGMENT} }
      currentPage totalPages totalElements hasNext hasPrevious
    }
  }
`;

const GET_BY_CREATED_BY = gql`
  query GetMaintenanceRequestsByCreatedBy($createdBy: String!, $offset: Int!, $limit: Int!) {
    getMaintenanceRequestsByCreatedBy(createdBy: $createdBy, offset: $offset, limit: $limit) {
      content { ${REQUEST_FRAGMENT} }
      currentPage totalPages totalElements hasNext hasPrevious
    }
  }
`;

const GET_BY_ID = gql`
  query GetMaintenanceRequestById($id: ID!) {
    getMaintenanceRequestById(id: $id) { ${REQUEST_FRAGMENT} }
  }
`;

const CREATE_MUTATION = gql`
  mutation CreateMaintenanceRequest($fixedAssetId: ID!, $title: String!, $description: String!) {
    createMaintenanceRequest(fixedAssetId: $fixedAssetId, title: $title, description: $description) {
      id title description status createdBy createdAt
      fixedAsset { id name category location status }
    }
  }
`;

const CREATE_MAINTENANCE = gql`
  mutation CreateMaintenance($maintenanceRequestId: ID!, $type: MaintenanceTypeEnum!, $description: String!, $userId: ID!, $imageUrl: String) {
    createMaintenance(maintenanceRequestId: $maintenanceRequestId, type: $type, description: $description, userId: $userId, imageUrl: $imageUrl) {
      id type description
      maintenanceRequest { id title status }
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateMaintenanceRequestStatus($id: ID!, $newStatus: MaintenanceRequestStatusEnum!) {
    updateMaintenanceRequestStatus(id: $id, newStatus: $newStatus) { id status }
  }
`;

interface PaginatedResponse {
  content: MaintenanceRequestDto[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class MaintenanceRequestRepositoryImpl extends MaintenanceRequestRepository {
  async listByStatus(
    status: MaintenanceRequestStatus,
    offset: number,
    limit: number,
  ): Promise<PaginatedResult<MaintenanceRequest>> {
    const { data } = await apolloClient.query<{
      getMaintenanceRequestsByStatus: PaginatedResponse;
    }>({
      query: GET_BY_STATUS,
      variables: { status, offset, limit },
      fetchPolicy: 'network-only',
    });
    if (!data) throw new Error('Sin datos de solicitudes por estado');
    const page = data.getMaintenanceRequestsByStatus;
    return {
      content: page.content.map(toMaintenanceRequest),
      currentPage: page.currentPage,
      totalPages: page.totalPages,
      totalElements: page.totalElements,
      hasNext: page.hasNext,
      hasPrevious: page.hasPrevious,
    };
  }

  async listByCreatedBy(
    createdBy: string,
    offset: number,
    limit: number,
  ): Promise<PaginatedResult<MaintenanceRequest>> {
    const { data } = await apolloClient.query<{
      getMaintenanceRequestsByCreatedBy: PaginatedResponse;
    }>({
      query: GET_BY_CREATED_BY,
      variables: { createdBy, offset, limit },
      fetchPolicy: 'network-only',
    });
    if (!data) throw new Error('Sin datos de solicitudes por creador');
    const page = data.getMaintenanceRequestsByCreatedBy;
    return {
      content: page.content.map(toMaintenanceRequest),
      currentPage: page.currentPage,
      totalPages: page.totalPages,
      totalElements: page.totalElements,
      hasNext: page.hasNext,
      hasPrevious: page.hasPrevious,
    };
  }

  async getById(id: string): Promise<MaintenanceRequest> {
    const { data } = await apolloClient.query<{
      getMaintenanceRequestById: MaintenanceRequestDto;
    }>({
      query: GET_BY_ID,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    if (!data) throw new Error('Sin datos de solicitud');
    return toMaintenanceRequest(data.getMaintenanceRequestById);
  }

  async create(input: CreateMaintenanceRequestInput): Promise<MaintenanceRequest> {
    const restDto: CreateSolicitudRestDto = {
      solicitante_id: input.solicitanteId,
      activo_id: input.fixedAssetId,
      area_id: input.areaId,
      tipo: input.tipo,
      prioridad: input.prioridad,
      descripcion: input.description,
      canal_origen: 'MOVIL',
      metadata: {},
    };

    const [gqlResult] = await Promise.all([
      apolloClient.mutate<{ createMaintenanceRequest: MaintenanceRequestDto }>({
        mutation: CREATE_MUTATION,
        variables: {
          fixedAssetId: input.fixedAssetId,
          title: input.title,
          description: input.description,
        },
      }),
      axiosClient.post('/solicitudes', restDto),
    ]);

    if (!gqlResult.data?.createMaintenanceRequest) {
      throw new Error('Error al crear la solicitud');
    }
    return toMaintenanceRequest(gqlResult.data.createMaintenanceRequest);
  }

  async tomarResponsabilidad(input: TomarResponsabilidadInput): Promise<void> {
    const restDto: UpdateEstadoRestDto = {
      estado: 'EN_PROCESO',
      tecnico_id: input.userId,
      diagnostico: input.description,
    };

    await Promise.all([
      apolloClient.mutate({
        mutation: CREATE_MAINTENANCE,
        variables: {
          maintenanceRequestId: input.maintenanceRequestId,
          type: input.type,
          description: input.description,
          userId: input.userId,
          imageUrl: input.imageUrl,
        },
      }),
      apolloClient.mutate({
        mutation: UPDATE_STATUS,
        variables: { id: input.maintenanceRequestId, newStatus: 'APPROVED' },
      }),
      axiosClient.patch(`/solicitudes/${input.maintenanceRequestId}/estado`, restDto),
    ]);
  }
}
