import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { useSolicitudesStore } from '../../state/solicitudes.store';
import SolicitudDetailSkeleton from '../components/SolicitudDetailSkeleton';
import ErrorMessage from '../../../../shared/ui/ErrorMessage';
import { useAuthStore } from '../../../auth/state/auth.store';
import { useSession } from '../../../../shared/hooks/useSession';
import { SolicitudesStackParams } from '../../../../core/navigation/navigation.types';
import { colors } from '../../../../shared/ui/theme';
import { MaintenanceType } from '../../domain/models/maintenance-request.model';

type Props = NativeStackScreenProps<SolicitudesStackParams, 'SolicitudDetail'>;

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  COMPLETED: 'Completado',
};

export default function SolicitudDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { selectedRequest, loadingDetail, loadingAction, error, loadRequestDetail, tomarResponsabilidad } =
    useSolicitudesStore();
  const { session } = useAuthStore();
  const { canTomarResponsabilidad } = useSession();

  const [modalVisible, setModalVisible] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('CORRECTIVE');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadRequestDetail(id);
  }, [id]);

  const handleTomarResponsabilidad = useCallback(async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'El diagnóstico es obligatorio');
      return;
    }
    if (!session) return;

    try {
      await tomarResponsabilidad({
        maintenanceRequestId: id,
        type: maintenanceType,
        description: description.trim(),
        userId: session.userId,
      });
      setModalVisible(false);
      Alert.alert('Éxito', 'Has tomado responsabilidad de esta solicitud', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      // error is set in store
    }
  }, [description, maintenanceType, id, session, tomarResponsabilidad, navigation]);

  if (loadingDetail) {
    return <SolicitudDetailSkeleton />;
  }

  if (!selectedRequest) {
    return (
      <ErrorMessage
        message="No se pudo cargar el detalle de la solicitud"
        onRetry={() => loadRequestDetail(id)}
      />
    );
  }

  const canTomar = canTomarResponsabilidad() && selectedRequest.status === 'PENDING';

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Solicitud</Text>
          <Text style={styles.title}>{selectedRequest.title}</Text>
          <Text style={styles.description}>{selectedRequest.description}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Estado</Text>
            <Text style={styles.value}>{STATUS_LABELS[selectedRequest.status] ?? selectedRequest.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Creado por</Text>
            <Text style={styles.value}>{selectedRequest.createdBy}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>
              {new Date(selectedRequest.createdAt).toLocaleDateString('es-BO')}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Activo fijo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{selectedRequest.fixedAsset.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Categoría</Text>
            <Text style={styles.value}>{selectedRequest.fixedAsset.category}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ubicación</Text>
            <Text style={styles.value}>{selectedRequest.fixedAsset.location}</Text>
          </View>
        </View>

        {selectedRequest.statusChangeLog.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Historial de estados</Text>
            {selectedRequest.statusChangeLog.map((log, i) => (
              <Text key={i} style={styles.logItem}>
                {STATUS_LABELS[log.fromStatus] ?? log.fromStatus} → {STATUS_LABELS[log.toStatus] ?? log.toStatus}
              </Text>
            ))}
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {canTomar && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Tomar responsabilidad</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tomar responsabilidad</Text>

            <Text style={styles.label}>Tipo de mantenimiento</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={maintenanceType}
                onValueChange={(v) => setMaintenanceType(v as MaintenanceType)}
              >
                <Picker.Item label="Correctivo" value="CORRECTIVE" />
                <Picker.Item label="Preventivo" value="PREVENTIVE" />
              </Picker>
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>Diagnóstico</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Describe el diagnóstico..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, loadingAction && styles.buttonDisabled]}
                onPress={handleTomarResponsabilidad}
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.confirmText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  logItem: {
    fontSize: 13,
    color: colors.muted,
    paddingVertical: 4,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
