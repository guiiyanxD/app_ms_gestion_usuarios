import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SolicitudesStack from './SolicitudesStack';
import CrearSolicitudScreen from '../../features/solicitudes/presentation/screens/CrearSolicitudScreen';
import BusquedaScreen from '../../features/busqueda/presentation/screens/BusquedaScreen';
import ProfileScreen from '../../features/auth/presentation/screens/ProfileScreen';
import { AppTabsParams } from './navigation.types';
import { useSession } from '../../shared/hooks/useSession';
import { colors } from '../../shared/ui/theme';

const Tab = createBottomTabNavigator<AppTabsParams>();

const TAB_ICONS: Record<string, string> = {
  SolicitudesTab: '📋',
  NuevaSolicitudTab: '➕',
  BusquedaTab: '🔍',
  PerfilTab: '👤',
};

export default function AppNavigator() {
  const { canCreateRequest } = useSession();
  const canCreate = canCreateRequest();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700' as const },
        tabBarIcon: () => (
          <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name] ?? ''}</Text>
        ),
      })}
    >
      <Tab.Screen
        name="SolicitudesTab"
        component={SolicitudesStack}
        options={{ headerShown: false, tabBarLabel: 'Solicitudes' }}
      />

      {canCreate && (
        <Tab.Screen
          name="NuevaSolicitudTab"
          component={CrearSolicitudScreen}
          options={{ title: 'Nueva solicitud', tabBarLabel: 'Nueva' }}
        />
      )}

      <Tab.Screen
        name="BusquedaTab"
        component={BusquedaScreen}
        options={{ title: 'Búsqueda', tabBarLabel: 'Búsqueda' }}
      />

      <Tab.Screen
        name="PerfilTab"
        component={ProfileScreen}
        options={{ title: 'Mi perfil', tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}
