import { PushTokenRepository } from '../repositories/push-token.repository';

export class DeactivateTokenUseCase {
  constructor(private readonly repo: PushTokenRepository) {}

  execute(userId: string): Promise<void> {
    return this.repo.deactivate(userId);
  }
}
