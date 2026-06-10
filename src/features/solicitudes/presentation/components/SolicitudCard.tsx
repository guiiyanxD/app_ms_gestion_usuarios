import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaintenanceRequest } from '../../domain/models/maintenance-request.model';
import { colors } from '../../../../shared/ui/theme';

interface Props {
  readonly item: MaintenanceRequest;
  readonly onPress: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: colors.warning,
  APPROVED: colors.success,
  REJECTED: colors.error,
  COMPLETED: colors.muted,
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  COMPLETED: 'Completado',
};

function SolicitudCard({ item, onPress }: Props) {
  const date = new Date(item.createdAt).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item.id)}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] ?? colors.muted }]}>
          <Text style={styles.badgeText}>{STATUS_LABELS[item.status] ?? item.status}</Text>
        </View>
      </View>
      <Text style={styles.asset} numberOfLines={1}>
        {item.fixedAsset.name} · {item.fixedAsset.category}
      </Text>
      <Text style={styles.location} numberOfLines={1}>{item.fixedAsset.location}</Text>
      <Text style={styles.date}>{date}</Text>
    </TouchableOpacity>
  );
}

export default React.memo(SolicitudCard);

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
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  asset: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    color: colors.border,
  },
});
