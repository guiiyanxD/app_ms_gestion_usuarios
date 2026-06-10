import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../../shared/ui/theme';

export default function BusquedaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Funcionalidad de búsqueda próximamente disponible</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  text: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
