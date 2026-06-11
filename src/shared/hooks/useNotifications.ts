import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { navigationRef } from '../../core/navigation/navigation-ref';
import { PushTokenRepositoryImpl } from '../../features/notifications/data/repositories/push-token.repository.impl';
import { RegisterTokenUseCase } from '../../features/notifications/domain/use-cases/register-token.use-case';
import { useSolicitudesStore } from '../../features/solicitudes/state/solicitudes.store';

const repo = new PushTokenRepositoryImpl();
const registerTokenUC = new RegisterTokenUseCase(repo);

function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNotificationsModule(): any | null {
  if (isExpoGo()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications');
}

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
    console.warn('[Push] Expo Go no soporta push notifications desde SDK 53. Usa el APK en un dispositivo físico.');
    return null;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mantenimiento', {
        name: 'Solicitudes de Mantenimiento',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4338ca',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
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

function navegarASolicitud(solicitudId: string) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('SolicitudesTab' as never, {
    screen: 'SolicitudDetail',
    params: { id: solicitudId },
  } as never);
}

export function useNotifications(userId: string | null) {
  const foregroundSub = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null);
  const tapSub = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null);

  // Registro del token al iniciar sesión
  useEffect(() => {
    if (!userId) return;

    getExpoPushToken().then((token) => {
      if (!token) return;
      registerTokenUC.execute({ userId, token });
    });
  }, [userId]);

  // Listeners de notificaciones (solo en builds nativos)
  useEffect(() => {
    if (!Notifications || !userId) return;

    // Foreground: app abierta y visible
    foregroundSub.current = Notifications.addNotificationReceivedListener(
      (notification: { request: { content: { data: Record<string, unknown> } } }) => {
        const data = notification.request.content.data;
        if (data?.tipo === 'NUEVA_SOLICITUD') {
          console.log('[Push] Nueva solicitud recibida:', data.codigo);
          useSolicitudesStore.getState().loadRequests(0);
        }
      },
    );

    // Tap: usuario toca la notificación (foreground o background)
    tapSub.current = Notifications.addNotificationResponseReceivedListener(
      (response: { notification: { request: { content: { data: Record<string, unknown> } } } }) => {
        const data = response.notification.request.content.data;
        if (data?.tipo === 'NUEVA_SOLICITUD' && typeof data.solicitudId === 'string') {
          navegarASolicitud(data.solicitudId);
        }
      },
    );

    // Cold-start: app cerrada → usuario toca notificación → app abre
    Notifications.getLastNotificationResponseAsync().then(
      (response: { notification: { request: { content: { data: Record<string, unknown> } } } } | null) => {
        if (!response) return;
        const data = response.notification.request.content.data;
        if (data?.tipo === 'NUEVA_SOLICITUD' && typeof data.solicitudId === 'string') {
          navegarASolicitud(data.solicitudId);
        }
      },
    );

    return () => {
      if (foregroundSub.current) Notifications.removeNotificationSubscription(foregroundSub.current);
      if (tapSub.current) Notifications.removeNotificationSubscription(tapSub.current);
    };
  }, [userId]);
}
