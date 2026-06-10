import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../state/auth.store';
import AppTextInput from '../../../../shared/ui/AppTextInput';
import AppButton from '../../../../shared/ui/AppButton';
import { colors } from '../../../../shared/ui/theme';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { login, loading, error } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values.email, values.password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Gestión de Activos</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'El correo es obligatorio',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido' },
          }}
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Correo electrónico"
              placeholder="usuario@empresa.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: 'La contraseña es obligatoria' }}
          render={({ field: { onChange, value } }) => (
            <AppTextInput
              label="Contraseña"
              placeholder="••••••••"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        {error && <Text style={styles.serverError}>{error}</Text>}

        <AppButton
          label="Iniciar sesión"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 28,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 24,
  },
  serverError: {
    fontSize: 13,
    color: colors.error,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    textAlign: 'center',
  },
});
