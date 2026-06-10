import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../../features/auth/state/auth.store';
import { useNetworkStatus } from '../../shared/hooks/useNetworkStatus';
import { useNotifications } from '../../shared/hooks/useNotifications';
import NetworkBanner from '../../shared/ui/NetworkBanner';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const { session, restoreSession } = useAuthStore();
  const { isOffline } = useNetworkStatus();

  // Pide permisos y registra el token cuando hay sesión activa.
  // userId null → el hook no hace nada (usuario no autenticado).
  useNotifications(session?.userId ?? null);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <View style={styles.root}>
      <NavigationContainer>
        {session ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <NetworkBanner visible={isOffline} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
