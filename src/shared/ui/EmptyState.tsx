import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

interface Props {
  readonly message: string;
  readonly detail?: string;
}

export default function EmptyState({ message, detail }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📭</Text>
      <Text style={styles.message}>{message}</Text>
      {detail && <Text style={styles.detail}>{detail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  detail: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
