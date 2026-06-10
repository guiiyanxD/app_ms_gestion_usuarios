export type UserRole = 'SUPERADMIN' | 'GERENTE' | 'TECNICO' | 'OPERADOR' | 'ASISTENTE';

export interface Session {
  readonly userId: string;
  readonly token: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: UserRole;
}
