import { create } from 'zustand';
import { useAuthStore } from '../../auth/state/auth.store';
import { MaintenanceRequestRepositoryImpl } from '../data/repositories/maintenance-request.repository.impl';
import {
  CreateMaintenanceRequestInput,
  MaintenanceRequest,
  TomarResponsabilidadInput,
} from '../domain/models/maintenance-request.model';
import { CreateRequestUseCase } from '../domain/use-cases/create-request.use-case';
import { GetRequestUseCase } from '../domain/use-cases/get-request.use-case';
import { ListMyRequestsUseCase } from '../domain/use-cases/list-my-requests.use-case';
import { ListPendingRequestsUseCase } from '../domain/use-cases/list-pending-requests.use-case';
import { TomarResponsabilidadUseCase } from '../domain/use-cases/tomar-responsabilidad.use-case';

interface SolicitudesState {
  requests: MaintenanceRequest[];
  selectedRequest: MaintenanceRequest | null;
  loading: boolean;
  loadingDetail: boolean;
  loadingAction: boolean;
  error: string | null;
  currentPage: number;
  hasNext: boolean;
  loadRequests: (page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  loadRequestDetail: (id: string) => Promise<void>;
  createRequest: (input: CreateMaintenanceRequestInput) => Promise<MaintenanceRequest>;
  tomarResponsabilidad: (input: TomarResponsabilidadInput) => Promise<void>;
  clearError: () => void;
}

const repo = new MaintenanceRequestRepositoryImpl();
const listPendingUC = new ListPendingRequestsUseCase(repo);
const listMyUC = new ListMyRequestsUseCase(repo);
const getRequestUC = new GetRequestUseCase(repo);
const createRequestUC = new CreateRequestUseCase(repo);
const tomarUC = new TomarResponsabilidadUseCase(repo);

export const useSolicitudesStore = create<SolicitudesState>((set, get) => ({
  requests: [],
  selectedRequest: null,
  loading: false,
  loadingDetail: false,
  loadingAction: false,
  error: null,
  currentPage: 0,
  hasNext: false,

  loadRequests: async (page = 0) => {
    set({ loading: true, error: null });
    try {
      const { session } = useAuthStore.getState();
      if (!session) throw new Error('Sin sesión activa');

      const viewsPending = session.role === 'TECNICO' || session.role === 'SUPERADMIN' || session.role === 'GERENTE';
      const result = viewsPending
        ? await listPendingUC.execute(page)
        : await listMyUC.execute(session.userId, page);

      set({
        requests: page === 0 ? result.content.slice() : [...get().requests, ...result.content],
        currentPage: page,
        hasNext: result.hasNext,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar solicitudes';
      set({ loading: false, error: message });
    }
  },

  loadMore: async () => {
    const { hasNext, currentPage, loading } = get();
    if (!hasNext || loading) return;
    await get().loadRequests(currentPage + 1);
  },

  loadRequestDetail: async (id) => {
    set({ loadingDetail: true, error: null });
    try {
      const request = await getRequestUC.execute(id);
      set({ selectedRequest: request, loadingDetail: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar detalle';
      set({ loadingDetail: false, error: message });
    }
  },

  createRequest: async (input) => {
    set({ loadingAction: true, error: null });
    try {
      const request = await createRequestUC.execute(input);
      set({ loadingAction: false });
      return request;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear solicitud';
      set({ loadingAction: false, error: message });
      throw err;
    }
  },

  tomarResponsabilidad: async (input) => {
    set({ loadingAction: true, error: null });
    try {
      await tomarUC.execute(input);
      set({ loadingAction: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al tomar responsabilidad';
      set({ loadingAction: false, error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
