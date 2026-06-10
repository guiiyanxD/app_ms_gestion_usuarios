import { PushToken } from '../models/push-token.model';
import { PushTokenRepository } from '../repositories/push-token.repository';

export class RegisterTokenUseCase {
  constructor(private readonly repo: PushTokenRepository) {}

  execute(pushToken: PushToken): Promise<void> {
    return this.repo.register(pushToken);
  }
}
