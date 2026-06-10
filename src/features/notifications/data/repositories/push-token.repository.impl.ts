import * as SecureStore from 'expo-secure-store';
import { PushToken } from '../../domain/models/push-token.model';
import { PushTokenRepository } from '../../domain/repositories/push-token.repository';

const PUSH_TOKEN_KEY = 'gestion.push-token';

export class PushTokenRepositoryImpl extends PushTokenRepository {
  async register(pushToken: PushToken): Promise<void> {
    // Persiste el token localmente para que quede disponible
    // cuando el backend implemente el endpoint
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, JSON.stringify(pushToken));

    // TODO: cuando el backend implemente el endpoint, reemplazar con:
    // await axiosClient.post(`/usuarios/${pushToken.userId}/push-token`, {
    //   token: pushToken.token,
    //   platform: pushToken.platform,
    // });

    console.log('[PushToken] Registrado localmente:', pushToken.token);
    console.log('[PushToken] Comparte este token con el admin del backend para pruebas manuales.');
  }
}
