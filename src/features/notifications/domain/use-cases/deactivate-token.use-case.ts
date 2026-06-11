import { PushTokenRepository } from '../repositories/push-token.repository';

export class DeactivateTokenUseCase {
  constructor(private readonly repo: PushTokenRepository) {}

  execute(userId: string, token: string): Promise<void> {
    return this.repo.deactivate(userId, token);
  }
}
