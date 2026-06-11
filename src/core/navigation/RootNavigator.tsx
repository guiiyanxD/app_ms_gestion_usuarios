import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../../features/auth/state/auth.store';
import { useNetworkStatus } from '../../shared/hooks/useNetworkStatus';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { navigationRef } from './navigation-ref';
import NetworkBanner from '../../shared/ui/NetworkBanner';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const { session, restoreSession } = useAuthStore();
  const { isOffline } = useNetworkStatus();

  // Usa restUserId para el registro del token en el microservicio REST.
  // Fallback a userId (GraphQL) si restUserId no está disponible.
  const notifUserId = session?.restUserId ?? session?.userId ?? null;
  useNotifications(notifUserId);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <View style={styles.root}>
      <NavigationContainer ref={navigationRef}>
        {session ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <NetworkBanner visible={isOffline} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
