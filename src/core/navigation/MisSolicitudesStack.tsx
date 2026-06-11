import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MisSolicitudesScreen from '../../features/solicitudes/presentation/screens/MisSolicitudesScreen';
import SolicitudDetailScreen from '../../features/solicitudes/presentation/screens/SolicitudDetailScreen';
import { SolicitudesStackParams } from './navigation.types';
import { colors } from '../../shared/ui/theme';

const Stack = createNativeStackNavigator<SolicitudesStackParams>();

export default function MisSolicitudesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="SolicitudesList"
        component={MisSolicitudesScreen}
        options={{ title: 'Mis solicitudes' }}
      />
      <Stack.Screen
        name="SolicitudDetail"
        component={SolicitudDetailScreen}
        options={{ title: 'Detalle' }}
      />
    </Stack.Navigator>
  );
}
