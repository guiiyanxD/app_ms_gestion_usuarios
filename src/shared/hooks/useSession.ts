import { useAuthStore } from '../../features/auth/state/auth.store';
import { UserRole } from '../../features/auth/domain/models/session.model';

const ROLES_CAN_CREATE: UserRole[] = ['OPERADOR', 'SUPERADMIN', 'GERENTE'];
const ROLES_CAN_TAKE: UserRole[] = ['TECNICO', 'SUPERADMIN'];

export function useSession() {
  const session = useAuthStore((s) => s.session);
  const role = session?.role ?? null;

  return {
    session,
    userId: session?.userId ?? null,
    role,
    isTecnico: () => role === 'TECNICO',
    isOperador: () => role === 'OPERADOR',
    isGerente: () => role === 'GERENTE',
    isSuperAdmin: () => role === 'SUPERADMIN',
    canCreateRequest: () => role !== null && ROLES_CAN_CREATE.includes(role),
    canTomarResponsabilidad: () => role !== null && ROLES_CAN_TAKE.includes(role),
  };
}
