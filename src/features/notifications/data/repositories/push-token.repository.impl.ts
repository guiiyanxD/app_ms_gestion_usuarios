import * as SecureStore from 'expo-secure-store';
import { axiosClient } from '../../../../core/api/axios.client';
import '../../../../core/api/axios.interceptor';
import { PushToken } from '../../domain/models/push-token.model';
import { PushTokenRepository } from '../../domain/repositories/push-token.repository';

const PUSH_TOKEN_KEY = 'gestion.push-token';

export class PushTokenRepositoryImpl extends PushTokenRepository {
  async register(pushToken: PushToken): Promise<void> {
    await axiosClient.post(`/users/${pushToken.userId}/push-token`, {
      token: pushToken.token,
    });
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, pushToken.token);
    console.log('[PushToken] Registrado en backend:', pushToken.token);
  }

  async deactivate(userId: string, token: string): Promise<void> {
    try {
      await axiosClient.delete(`/users/${userId}/push-token`, {
        data: { token },
      });
    } catch {
      // 404 es aceptable — token ya eliminado o no registrado
    }
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
    console.log('[PushToken] Desactivado para userId:', userId);
  }
}
