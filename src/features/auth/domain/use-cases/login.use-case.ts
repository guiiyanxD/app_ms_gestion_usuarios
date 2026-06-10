import { Credentials } from '../models/credentials.model';
import { Session } from '../models/session.model';
import { AuthRepository } from '../repositories/auth.repository';

export class LoginUseCase {
  constructor(private readonly repo: AuthRepository) {}

  execute(credentials: Credentials): Promise<Session> {
    return this.repo.login(credentials);
  }
}
