import { create } from 'zustand';
import { useAuthStore } from '../../auth/state/auth.store';
import { MaintenanceRequestRepositoryImpl } from '../data/repositories/maintenance-request.repository.impl';
import {
  CompletarInput,
  CreateMaintenanceRequestInput,
  DiagnosticarInput,
  MaintenanceRequest,
  TomarResponsabilidadInput,
} from '../domain/models/maintenance-request.model';
import { CompletarUseCase } from '../domain/use-cases/completar.use-case';
import { CreateRequestUseCase } from '../domain/use-cases/create-request.use-case';
import { DiagnosticarUseCase } from '../domain/use-cases/diagnosticar.use-case';
import { GetRequestUseCase } from '../domain/use-cases/get-request.use-case';
import { ListByTecnicoUseCase } from '../domain/use-cases/list-approved-requests.use-case';
import { ListMyRequestsUseCase } from '../domain/use-cases/list-my-requests.use-case';
import { ListPendingRequestsUseCase } from '../domain/use-cases/list-pending-requests.use-case';
import { TomarResponsabilidadUseCase } from '../domain/use-cases/tomar-responsabilidad.use-case';
import { extractApiError } from '../../../shared/utils/extract-api-error';

interface SolicitudesState {
  requests: MaintenanceRequest[];
  assignedRequests: MaintenanceRequest[];
  selectedRequest: MaintenanceRequest | null;
  loading: boolean;
  loadingAssigned: boolean;
  loadingDetail: boolean;
  loadingAction: boolean;
  error: string | null;
  currentPage: number;
  currentPageAssigned: number;
  hasNext: boolean;
  hasNextAssigned: boolean;
  loadRequests: (page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  loadMyAssignedRequests: (page?: number) => Promise<void>;
  loadMoreAssigned: () => Promise<void>;
  loadRequestDetail: (id: string) => Promise<void>;
  createRequest: (input: CreateMaintenanceRequestInput) => Promise<MaintenanceRequest>;
  tomarResponsabilidad: (input: TomarResponsabilidadInput) => Promise<void>;
  diagnosticar: (input: DiagnosticarInput) => Promise<void>;
  completar: (input: CompletarInput) => Promise<void>;
  clearError: () => void;
}

const repo = new MaintenanceRequestRepositoryImpl();
const listPendingUC = new ListPendingRequestsUseCase(repo);
const listByTecnicoUC = new ListByTecnicoUseCase(repo);
const listMyUC = new ListMyRequestsUseCase(repo);
const getRequestUC = new GetRequestUseCase(repo);
const createRequestUC = new CreateRequestUseCase(repo);
const tomarUC = new TomarResponsabilidadUseCase(repo);
const diagnosticarUC = new DiagnosticarUseCase(repo);
const completarUC = new CompletarUseCase(repo);

export const useSolicitudesStore = create<SolicitudesState>((set, get) => ({
  requests: [],
  assignedRequests: [],
  selectedRequest: null,
  loading: false,
  loadingAssigned: false,
  loadingDetail: false,
  loadingAction: false,
  error: null,
  currentPage: 0,
  currentPageAssigned: 0,
  hasNext: false,
  hasNextAssigned: false,

  loadRequests: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const { session } = useAuthStore.getState();
      if (!session) throw new Error('Sin sesión activa');

      const viewsPending =
        session.role === 'TECNICO' ||
        session.role === 'SUPERADMIN' ||
        session.role === 'GERENTE';

      const solicitanteId = session.restUserId ?? session.userId;

      const result = viewsPending
        ? await listPendingUC.execute(page)
        : await listMyUC.execute(solicitanteId, page);

      set({
        requests: page === 0 ? result.content.slice() : [...get().requests, ...result.content],
        currentPage: page,
        hasNext: result.hasNext,
        loading: false,
      });
    } catch (err: unknown) {
      set({ loading: false, error: extractApiError(err, 'Error al cargar solicitudes') });
    }
  },

  loadMore: async () => {
    const { hasNext, currentPage, loading } = get();
    if (!hasNext || loading) return;
    await get().loadRequests(currentPage + 1);
  },

  loadMyAssignedRequests: async (page = 0) => {
    set({ loadingAssigned: true, error: null });
    try {
      const { session } = useAuthStore.getState();
      if (!session) throw new Error('Sin sesión activa');
      const tecnicoId = session.restUserId ?? session.userId;
      const result = await listByTecnicoUC.execute(tecnicoId, page);
      set({
        assignedRequests:
          page === 0 ? result.content.slice() : [...get().assignedRequests, ...result.content],
        currentPageAssigned: page,
        hasNextAssigned: result.hasNext,
        loadingAssigned: false,
      });
    } catch (err: unknown) {
      set({ loadingAssigned: false, error: extractApiError(err, 'Error al cargar solicitudes asignadas') });
    }
  },

  loadMoreAssigned: async () => {
    const { hasNextAssigned, currentPageAssigned, loadingAssigned } = get();
    if (!hasNextAssigned || loadingAssigned) return;
    await get().loadMyAssignedRequests(currentPageAssigned + 1);
  },

  loadRequestDetail: async (id) => {
    set({ loadingDetail: true, error: null });
    try {
      const request = await getRequestUC.execute(id);
      set({ selectedRequest: request, loadingDetail: false });
    } catch (err: unknown) {
      set({ loadingDetail: false, error: extractApiError(err, 'Error al cargar detalle') });
    }
  },

  createRequest: async (input) => {
    set({ loadingAction: true, error: null });
    try {
      const request = await createRequestUC.execute(input);
      set({ loadingAction: false });
      return request;
    } catch (err: unknown) {
      set({ loadingAction: false, error: extractApiError(err, 'Error al crear solicitud') });
      throw err;
    }
  },

  tomarResponsabilidad: async (input) => {
    set({ loadingAction: true, error: null });
    try {
      await tomarUC.execute(input);
      set({ loadingAction: false });
    } catch (err: unknown) {
      set({ loadingAction: false, error: extractApiError(err, 'Error al tomar responsabilidad') });
      throw err;
    }
  },

  diagnosticar: async (input) => {
    set({ loadingAction: true, error: null });
    try {
      await diagnosticarUC.execute(input);
      set({ loadingAction: false });
    } catch (err: unknown) {
      set({ loadingAction: false, error: extractApiError(err, 'Error al guardar diagnóstico') });
      throw err;
    }
  },

  completar: async (input) => {
    set({ loadingAction: true, error: null });
    try {
      await completarUC.execute(input);
      set({ loadingAction: false });
    } catch (err: unknown) {
      set({ loadingAction: false, error: extractApiError(err, 'Error al completar mantenimiento') });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
