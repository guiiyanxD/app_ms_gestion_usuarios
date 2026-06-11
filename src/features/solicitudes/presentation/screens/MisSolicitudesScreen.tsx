import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSolicitudesStore } from '../../state/solicitudes.store';
import SolicitudCard from '../components/SolicitudCard';
import SolicitudCardSkeleton from '../components/SolicitudCardSkeleton';
import EmptyState from '../../../../shared/ui/EmptyState';
import ErrorMessage from '../../../../shared/ui/ErrorMessage';
import { SolicitudesStackParams } from '../../../../core/navigation/navigation.types';
import { colors } from '../../../../shared/ui/theme';

type Props = NativeStackScreenProps<SolicitudesStackParams, 'SolicitudesList'>;

const SKELETON_COUNT = 5;

export default function MisSolicitudesScreen({ navigation }: Props) {
  const {
    assignedRequests,
    loadingAssigned,
    hasNextAssigned,
    error,
    loadMyAssignedRequests,
    loadMoreAssigned,
  } = useSolicitudesStore();

  useEffect(() => {
    loadMyAssignedRequests(0);
  }, []);

  const handleRefresh = useCallback(() => {
    loadMyAssignedRequests(0);
  }, [loadMyAssignedRequests]);

  const handlePress = useCallback(
    (id: string) => {
      navigation.navigate('SolicitudDetail', { id });
    },
    [navigation],
  );

  if (loadingAssigned && assignedRequests.length === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>Mis solicitudes en proceso</Text>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SolicitudCardSkeleton key={i} />
        ))}
      </View>
    );
  }

  if (error && assignedRequests.length === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>Mis solicitudes en proceso</Text>
        <ErrorMessage message={error} onRetry={() => loadMyAssignedRequests(0)} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Mis solicitudes en proceso</Text>

      <FlatList
        data={assignedRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SolicitudCard item={item} onPress={handlePress} />}
        refreshControl={
          <RefreshControl
            refreshing={loadingAssigned && assignedRequests.length > 0}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMoreAssigned}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          hasNextAssigned ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !loadingAssigned ? (
            <EmptyState
              message="Sin solicitudes en proceso"
              detail="No tienes solicitudes asignadas en este momento."
            />
          ) : null
        }
        contentContainerStyle={
          assignedRequests.length === 0 ? styles.emptyContainer : styles.list
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  footer: {
    paddingVertical: 16,
  },
});
