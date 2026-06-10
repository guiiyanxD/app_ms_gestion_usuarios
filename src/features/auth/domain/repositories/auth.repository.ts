import { Credentials } from '../models/credentials.model';
import { Session } from '../models/session.model';

export abstract class AuthRepository {
  abstract login(credentials: Credentials): Promise<Session>;
}
