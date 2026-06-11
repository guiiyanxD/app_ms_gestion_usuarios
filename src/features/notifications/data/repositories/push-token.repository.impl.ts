import { springAxiosClient } from '../../../../core/api/spring-axios.client';
import { PushToken } from '../../domain/models/push-token.model';
import { PushTokenRepository } from '../../domain/repositories/push-token.repository';

export class PushTokenRepositoryImpl extends PushTokenRepository {
  async register(pushToken: PushToken): Promise<void> {
    await springAxiosClient.post(`/usuarios/${pushToken.userId}/push-token`, {
      token: pushToken.token,
      platform: pushToken.platform,
    });
    console.log('[PushToken] Registrado en backend:', pushToken.token);
  }

  async deactivate(userId: string): Promise<void> {
    await springAxiosClient.delete(`/usuarios/${userId}/push-token`);
    console.log('[PushToken] Desactivado para userId:', userId);
  }
}
