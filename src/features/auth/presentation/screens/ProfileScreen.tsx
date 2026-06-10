import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../state/auth.store';
import AppButton from '../../../../shared/ui/AppButton';
import { colors } from '../../../../shared/ui/theme';

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Administrador',
  GERENTE: 'Gerente',
  TECNICO: 'Técnico',
  OPERADOR: 'Operador',
  ASISTENTE: 'Asistente',
};

export default function ProfileScreen() {
  const { session, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
      ],
    );
  };

  if (!session) return null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitials}>
          {session.firstName[0]}{session.lastName[0]}
        </Text>
      </View>

      <Text style={styles.name}>{session.firstName} {session.lastName}</Text>
      <Text style={styles.email}>{session.email}</Text>

      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{ROLE_LABELS[session.role] ?? session.role}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Nombre" value={`${session.firstName} ${session.lastName}`} />
        <Row label="Correo" value={session.email} />
        <Row label="Rol" value={ROLE_LABELS[session.role] ?? session.role} last />
      </View>

      <AppButton
        label="Cerrar sesión"
        variant="danger"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 24,
  },
  roleText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  logoutBtn: {
    width: '100%',
  },
});
