import { create } from 'zustand';
import { tokenStorage } from '../../../core/auth/storage/token.storage';
import { AuthRepositoryImpl } from '../data/repositories/auth.repository.impl';
import { Session } from '../domain/models/session.model';
import { LoginUseCase } from '../domain/use-cases/login.use-case';
import { PushTokenRepositoryImpl } from '../../notifications/data/repositories/push-token.repository.impl';
import { DeactivateTokenUseCase } from '../../notifications/domain/use-cases/deactivate-token.use-case';

interface AuthState {
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const repo = new AuthRepositoryImpl();
const loginUC = new LoginUseCase(repo);
const pushRepo = new PushTokenRepositoryImpl();
const deactivateTokenUC = new DeactivateTokenUseCase(pushRepo);

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const session = await loginUC.execute({ email, password });
      await tokenStorage.save({
        token: session.token,
        userId: session.userId,
        firstName: session.firstName,
        lastName: session.lastName,
        email: session.email,
        role: session.role,
        restUserId: session.restUserId,
      });
      set({ session, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      set({ loading: false, error: message });
    }
  },

  logout: async () => {
    const stored = await tokenStorage.get();
    if (stored?.userId) {
      try {
        await deactivateTokenUC.execute(stored.userId);
      } catch {
        // no bloquear el logout si falla la desactivación
      }
    }
    await tokenStorage.clear();
    set({ session: null, error: null });
  },

  restoreSession: async () => {
    const stored = await tokenStorage.get();
    if (!stored) return;
    set({
      session: {
        userId: stored.userId,
        token: stored.token,
        firstName: stored.firstName,
        lastName: stored.lastName,
        email: stored.email,
        role: stored.role as Session['role'],
        restUserId: stored.restUserId ?? null,
      },
    });
  },
}));
