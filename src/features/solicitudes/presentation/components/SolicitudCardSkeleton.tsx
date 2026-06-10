import React from 'react';
import { StyleSheet, View } from 'react-native';
import SkeletonItem from '../../../../shared/ui/SkeletonItem';
import { colors } from '../../../../shared/ui/theme';

export default function SolicitudCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonItem width="65%" height={16} />
        <SkeletonItem width={72} height={22} borderRadius={6} />
      </View>
      <SkeletonItem width="50%" height={13} style={styles.row} />
      <SkeletonItem width="35%" height={12} style={styles.row} />
      <SkeletonItem width={80} height={11} style={styles.row} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  row: {
    marginTop: 6,
  },
});
