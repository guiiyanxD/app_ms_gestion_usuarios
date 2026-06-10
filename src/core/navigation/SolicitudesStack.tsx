import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SolicitudesListScreen from '../../features/solicitudes/presentation/screens/SolicitudesListScreen';
import SolicitudDetailScreen from '../../features/solicitudes/presentation/screens/SolicitudDetailScreen';
import { SolicitudesStackParams } from './navigation.types';
import { colors } from '../../shared/ui/theme';

const Stack = createNativeStackNavigator<SolicitudesStackParams>();

export default function SolicitudesStack() {
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
        component={SolicitudesListScreen}
        options={{ title: 'Solicitudes' }}
      />
      <Stack.Screen
        name="SolicitudDetail"
        component={SolicitudDetailScreen}
        options={{ title: 'Detalle' }}
      />
    </Stack.Navigator>
  );
}
