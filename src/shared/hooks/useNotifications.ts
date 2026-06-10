import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { PushTokenRepositoryImpl } from '../../features/notifications/data/repositories/push-token.repository.impl';
import { RegisterTokenUseCase } from '../../features/notifications/domain/use-cases/register-token.use-case';

const repo = new PushTokenRepositoryImpl();
const registerTokenUC = new RegisterTokenUseCase(repo);

function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

// Carga expo-notifications solo cuando NO es Expo Go.
// Un import estático haría que el módulo nativo (ausente en Expo Go SDK 53+)
// se cargue al iniciar la app y crashee antes de ejecutar ningún JS.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNotificationsModule(): any | null {
  if (isExpoGo()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications');
}

// Configurar el handler de foreground solo en builds nativos
const Notifications = getNotificationsModule();
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function getExpoPushToken(): Promise<string | null> {
  if (!Notifications) {
    console.warn('[Push] Expo Go no soporta push notifications desde SDK 53. Usa el APK de preview en un dispositivo físico.');
    return null;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Gestión de Activos',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4338ca',
        sound: 'default',
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    const finalStatus = existing === 'granted'
      ? existing
      : (await Notifications.requestPermissionsAsync()).status;

    if (finalStatus !== 'granted') {
      console.log('[Push] Permisos denegados por el usuario.');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    console.log('[Push] Token obtenido:', tokenData.data);
    return tokenData.data;
  } catch (err) {
    console.log('[Push] Error obteniendo token:', err);
    return null;
  }
}

export function useNotifications(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    getExpoPushToken().then((token) => {
      if (!token) return;
      registerTokenUC.execute({ userId, token, platform });
    });
  }, [userId]);
}
