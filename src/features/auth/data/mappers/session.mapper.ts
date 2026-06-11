import { Session, UserRole } from '../../domain/models/session.model';
import { LoginResponseDto } from '../dto/auth.dto';

function decodeRole(token: string): UserRole {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { role: string };
    return payload.role as UserRole;
  } catch {
    return 'OPERADOR';
  }
}

export function toSession(dto: LoginResponseDto, restUserId: string | null): Session {
  return {
    userId: dto.id,
    token: dto.token,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    role: decodeRole(dto.token),
    restUserId,
  };
}
