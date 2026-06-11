import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSolicitudesStore } from '../../state/solicitudes.store';
import SolicitudDetailSkeleton from '../components/SolicitudDetailSkeleton';
import ErrorMessage from '../../../../shared/ui/ErrorMessage';
import { useAuthStore } from '../../../auth/state/auth.store';
import { useSession } from '../../../../shared/hooks/useSession';
import { SolicitudesStackParams } from '../../../../core/navigation/navigation.types';
import { colors } from '../../../../shared/ui/theme';

type Props = NativeStackScreenProps<SolicitudesStackParams, 'SolicitudDetail'>;

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'En proceso',
  REJECTED: 'Rechazado',
  COMPLETED: 'Completado',
};

type ActiveModal = 'tomar' | 'diagnosticar' | 'completar' | null;

export default function SolicitudDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const {
    selectedRequest,
    loadingDetail,
    loadingAction,
    error,
    loadRequestDetail,
    tomarResponsabilidad,
    diagnosticar,
    completar,
  } = useSolicitudesStore();
  const { session } = useAuthStore();
  const { canTomarResponsabilidad } = useSession();

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [diagnosticoText, setDiagnosticoText] = useState('');
  const [solucionText, setSolucionText] = useState('');
  const [costoText, setCostoText] = useState('');

  useEffect(() => {
    loadRequestDetail(id);
  }, [id]);

  const closeModal = () => setActiveModal(null);

  const handleTomarResponsabilidad = useCallback(async () => {
    if (!session) return;
    try {
      await tomarResponsabilidad({
        maintenanceRequestId: id,
        tecnicoRestId: session.restUserId ?? session.userId,
      });
      closeModal();
      Alert.alert('Éxito', 'Has tomado responsabilidad de esta solicitud', [
        { text: 'OK', onPress: () => { loadRequestDetail(id); navigation.goBack(); } },
      ]);
    } catch {
      // error shown via store
    }
  }, [id, session, tomarResponsabilidad, navigation, loadRequestDetail]);

  const handleDiagnosticar = useCallback(async () => {
    if (!session) return;
    if (!diagnosticoText.trim()) {
      Alert.alert('Error', 'El diagnóstico no puede estar vacío');
      return;
    }
    try {
      await diagnosticar({
        maintenanceRequestId: id,
        diagnostico: diagnosticoText.trim(),
        tecnicoRestId: session.restUserId ?? session.userId,
      });
      closeModal();
      setDiagnosticoText('');
      Alert.alert('Éxito', 'Diagnóstico guardado correctamente', [
        { text: 'OK', onPress: () => loadRequestDetail(id) },
      ]);
    } catch {
      // error shown via store
    }
  }, [session, diagnosticoText, id, diagnosticar, loadRequestDetail]);

  const handleCompletar = useCallback(async () => {
    if (!solucionText.trim()) {
      Alert.alert('Error', 'La solución aplicada es obligatoria');
      return;
    }
    const costo = costoText.trim() ? parseFloat(costoText.trim()) : undefined;
    if (costoText.trim() && isNaN(costo!)) {
      Alert.alert('Error', 'El costo debe ser un número válido');
      return;
    }
    try {
      await completar({ maintenanceRequestId: id, solucion: solucionText.trim(), costo });
      closeModal();
      setSolucionText('');
      setCostoText('');
      Alert.alert('Éxito', 'Mantenimiento completado correctamente', [
        { text: 'OK', onPress: () => loadRequestDetail(id) },
      ]);
    } catch {
      // error shown via store
    }
  }, [solucionText, costoText, id, completar, loadRequestDetail]);

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

  const canActuar = canTomarResponsabilidad();
  const isPending = selectedRequest.status === 'PENDING';
  const isEnProceso = selectedRequest.status === 'APPROVED';
  const isCompleted = selectedRequest.status === 'COMPLETED';

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Información principal */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Solicitud</Text>
          <Text style={styles.title}>{selectedRequest.codigo}</Text>
          <Text style={styles.title}>{selectedRequest.title}</Text>
          <Text style={styles.description}>{selectedRequest.description}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Estado</Text>
            <Text style={[styles.value, statusValueStyle(selectedRequest.status)]}>
              {STATUS_LABELS[selectedRequest.status] ?? selectedRequest.status}
            </Text>
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

        {/* Activo fijo */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Activo fijo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{selectedRequest.fixedAsset.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Codigo Activo</Text>
            <Text style={styles.value}>{selectedRequest.fixedAsset.category}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Area</Text>
            <Text style={styles.value}>{selectedRequest.fixedAsset.location}</Text>
          </View>
        </View>

        {/* Diagnóstico — visible cuando existe */}
        {selectedRequest.diagnostico ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Diagnóstico</Text>
            <Text style={styles.bodyText}>{selectedRequest.diagnostico}</Text>
          </View>
        ) : (isEnProceso || isCompleted) ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Diagnóstico</Text>
            <Text style={styles.mutedText}>Sin diagnóstico aún.</Text>
          </View>
        ) : null}

        {/* Resolución — visible cuando está completado */}
        {isCompleted && (selectedRequest.solucion || selectedRequest.costo != null) && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Resolución</Text>
            {selectedRequest.solucion ? (
              <Text style={styles.bodyText}>{selectedRequest.solucion}</Text>
            ) : null}
            {selectedRequest.costo != null && (
              <View style={[styles.row, { marginTop: 8 }]}>
                <Text style={styles.label}>Costo</Text>
                <Text style={styles.value}>Bs. {selectedRequest.costo.toFixed(2)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Historial */}
        {selectedRequest.statusChangeLog.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Historial de estados</Text>
            {selectedRequest.statusChangeLog.map((log, i) => (
              <Text key={i} style={styles.logItem}>
                {STATUS_LABELS[log.fromStatus] ?? log.fromStatus} →{' '}
                {STATUS_LABELS[log.toStatus] ?? log.toStatus}
              </Text>
            ))}
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Botones de acción según estado y rol */}
        {canActuar && isPending && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveModal('tomar')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Tomar responsabilidad</Text>
          </TouchableOpacity>
        )}

        {canActuar && isEnProceso && !selectedRequest.diagnostico && (
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => setActiveModal('diagnosticar')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Diagnosticar</Text>
          </TouchableOpacity>
        )}

        {canActuar && isEnProceso && (
          <TouchableOpacity
            style={[styles.actionButton, styles.successButton]}
            onPress={() => setActiveModal('completar')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Completar mantenimiento</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Modal: Tomar responsabilidad */}
      <Modal
        visible={activeModal === 'tomar'}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tomar responsabilidad</Text>
            <Text style={styles.label}>
              ¿Confirmas que tomarás responsabilidad de esta solicitud?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
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

      {/* Modal: Diagnosticar */}
      <Modal
        visible={activeModal === 'diagnosticar'}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Diagnóstico</Text>

            <Text style={styles.label}>Describe el problema identificado *</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Descripción del problema encontrado..."
              multiline
              numberOfLines={4}
              value={diagnosticoText}
              onChangeText={setDiagnosticoText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, loadingAction && styles.buttonDisabled]}
                onPress={handleDiagnosticar}
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.confirmText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: Completar */}
      <Modal
        visible={activeModal === 'completar'}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Completar mantenimiento</Text>

            <Text style={styles.label}>Solución aplicada *</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Describe lo que se realizó..."
              multiline
              numberOfLines={4}
              value={solucionText}
              onChangeText={setSolucionText}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Costo (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 150.00"
              keyboardType="decimal-pad"
              value={costoText}
              onChangeText={setCostoText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.successButton, loadingAction && styles.buttonDisabled]}
                onPress={handleCompletar}
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.confirmText}>Completar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function statusValueStyle(status: string) {
  switch (status) {
    case 'PENDING': return { color: colors.warning };
    case 'APPROVED': return { color: colors.primary };
    case 'COMPLETED': return { color: colors.success };
    default: return {};
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
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
  bodyText: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  mutedText: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: 'italic',
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
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: colors.warning,
  },
  successButton: {
    backgroundColor: colors.success,
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.surface,
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
