import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import SkeletonItem from '../../../../shared/ui/SkeletonItem';
import { colors } from '../../../../shared/ui/theme';

export default function SolicitudDetailSkeleton() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {[0, 1].map((i) => (
        <View key={i} style={styles.card}>
          <SkeletonItem width={80} height={11} borderRadius={4} style={styles.mb8} />
          <SkeletonItem width="80%" height={20} style={styles.mb8} />
          <SkeletonItem width="100%" height={14} style={styles.mb4} />
          <SkeletonItem width="90%" height={14} style={styles.mb16} />
          <SkeletonItem width="100%" height={1} style={styles.mb8} />
          {[0, 1, 2].map((j) => (
            <View key={j} style={styles.row}>
              <SkeletonItem width="30%" height={13} />
              <SkeletonItem width="40%" height={13} />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
