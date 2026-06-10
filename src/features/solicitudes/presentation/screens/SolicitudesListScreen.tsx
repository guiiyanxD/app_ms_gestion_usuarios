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
import { useAuthStore } from '../../../auth/state/auth.store';

type Props = NativeStackScreenProps<SolicitudesStackParams, 'SolicitudesList'>;

const SKELETON_COUNT = 5;

export default function SolicitudesListScreen({ navigation }: Props) {
  const { requests, loading, error, hasNext, loadRequests, loadMore } = useSolicitudesStore();
  const { session } = useAuthStore();

  useEffect(() => {
    loadRequests(0);
  }, []);

  const handleRefresh = useCallback(() => {
    loadRequests(0);
  }, [loadRequests]);

  const handlePress = useCallback((id: string) => {
    navigation.navigate('SolicitudDetail', { id });
  }, [navigation]);

  const viewsPending = session?.role === 'TECNICO' || session?.role === 'SUPERADMIN' || session?.role === 'GERENTE';
  const title = viewsPending ? 'Solicitudes Pendientes' : 'Mis Solicitudes';

  if (loading && requests.length === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>{title}</Text>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SolicitudCardSkeleton key={i} />
        ))}
      </View>
    );
  }

  if (error && requests.length === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.heading}>{title}</Text>
        <ErrorMessage
          message={error}
          onRetry={() => loadRequests(0)}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>{title}</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SolicitudCard item={item} onPress={handlePress} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading && requests.length > 0}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          hasNext ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              message="Sin solicitudes"
              detail={
                session?.role === 'TECNICO'
                  ? 'No hay solicitudes pendientes en este momento.'
                  : 'Aún no has creado ninguna solicitud.'
              }
            />
          ) : null
        }
        contentContainerStyle={requests.length === 0 ? styles.emptyContainer : styles.list}
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
