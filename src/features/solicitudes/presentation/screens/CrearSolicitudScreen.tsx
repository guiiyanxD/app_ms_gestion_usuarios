import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useSolicitudesStore } from '../../state/solicitudes.store';
import { useAuthStore } from '../../../auth/state/auth.store';
import { fetchFixedAssetOptions } from '../../../catalogs/data/repositories/fixed-asset-option.repository.impl';
import { fetchAreaOptions } from '../../../catalogs/data/repositories/area-option.repository.impl';
import { FixedAssetOption, AreaOption } from '../../../catalogs/domain/models/catalog.model';
import AppTextInput from '../../../../shared/ui/AppTextInput';
import AppPicker from '../../../../shared/ui/AppPicker';
import AppButton from '../../../../shared/ui/AppButton';
import ErrorMessage from '../../../../shared/ui/ErrorMessage';
import { colors } from '../../../../shared/ui/theme';
import { MaintenanceTipo, MaintenancePrioridad } from '../../domain/models/maintenance-request.model';

interface FormValues {
  fixedAssetId: string;
  title: string;
  description: string;
  tipo: MaintenanceTipo;
  prioridad: MaintenancePrioridad;
  areaId: number;
}

const TIPO_OPTIONS = [
  { label: 'Correctivo', value: 'CORRECTIVO' },
  { label: 'Preventivo', value: 'PREVENTIVO' },
] as const;

const PRIORIDAD_OPTIONS = [
  { label: 'Alta', value: 'ALTA' },
  { label: 'Media', value: 'MEDIA' },
  { label: 'Baja', value: 'BAJA' },
] as const;

export default function CrearSolicitudScreen() {
  const { createRequest, loadingAction, error } = useSolicitudesStore();
  const { session } = useAuthStore();

  const [assets, setAssets] = useState<FixedAssetOption[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: {
      fixedAssetId: '',
      title: '',
      description: '',
      tipo: 'CORRECTIVO',
      prioridad: 'ALTA',
      areaId: 0,
    },
  });

  const loadCatalogs = () => {
    setLoadingCatalogs(true);
    setCatalogError(null);
    Promise.all([fetchFixedAssetOptions(), fetchAreaOptions()])
      .then(([assetList, areaList]) => {
        setAssets(assetList);
        setAreas(areaList);
      })
      .catch(() => setCatalogError('No se pudieron cargar los catálogos. Verifica tu conexión.'))
      .finally(() => setLoadingCatalogs(false));
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (!session) return;
    try {
      await createRequest({
        fixedAssetId: values.fixedAssetId,
        title: values.title,
        description: values.description,
        tipo: values.tipo,
        prioridad: values.prioridad,
        areaId: values.areaId,
        solicitanteId: session.userId,
      });
      reset();
      Alert.alert('Éxito', 'Solicitud creada correctamente');
    } catch {
      // error shown via store
    }
  };

  if (loadingCatalogs) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Cargando catálogos...</Text>
      </View>
    );
  }

  if (catalogError) {
    return <ErrorMessage message={catalogError} onRetry={loadCatalogs} />;
  }

  const assetOptions = [
    { label: '— Seleccionar activo —', value: '' },
    ...assets.map((a) => ({ label: `${a.name} (${a.category})`, value: a.id })),
  ];

  const areaOptions = [
    { label: '— Seleccionar área —', value: 0 },
    ...areas.map((a) => ({ label: a.nombre, value: a.id })),
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Nueva solicitud</Text>

      <Controller
        control={control}
        name="fixedAssetId"
        rules={{ validate: (v) => v !== '' || 'Selecciona un activo' }}
        render={({ field: { onChange, value } }) => (
          <AppPicker
            label="Activo fijo *"
            options={assetOptions}
            selectedValue={value}
            onValueChange={(v) => onChange(String(v))}
            error={errors.fixedAssetId?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="title"
        rules={{
          required: 'El título es obligatorio',
          minLength: { value: 5, message: 'Mínimo 5 caracteres' },
        }}
        render={({ field: { onChange, value } }) => (
          <AppTextInput
            label="Título *"
            placeholder="Título de la solicitud"
            value={value}
            onChangeText={onChange}
            error={errors.title?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        rules={{
          required: 'La descripción es obligatoria',
          minLength: { value: 10, message: 'Mínimo 10 caracteres' },
        }}
        render={({ field: { onChange, value } }) => (
          <AppTextInput
            label="Descripción *"
            placeholder="Describe el problema o mantenimiento requerido..."
            multiline
            numberOfLines={4}
            value={value}
            onChangeText={onChange}
            error={errors.description?.message}
            style={styles.textarea}
          />
        )}
      />

      <Controller
        control={control}
        name="tipo"
        render={({ field: { onChange, value } }) => (
          <AppPicker
            label="Tipo"
            options={TIPO_OPTIONS}
            selectedValue={value}
            onValueChange={(v) => onChange(v as MaintenanceTipo)}
          />
        )}
      />

      <Controller
        control={control}
        name="prioridad"
        render={({ field: { onChange, value } }) => (
          <AppPicker
            label="Prioridad"
            options={PRIORIDAD_OPTIONS}
            selectedValue={value}
            onValueChange={(v) => onChange(v as MaintenancePrioridad)}
          />
        )}
      />

      <Controller
        control={control}
        name="areaId"
        rules={{ validate: (v) => v !== 0 || 'Selecciona un área' }}
        render={({ field: { onChange, value } }) => (
          <AppPicker
            label="Área *"
            options={areaOptions}
            selectedValue={value}
            onValueChange={(v) => onChange(Number(v))}
            error={errors.areaId?.message}
          />
        )}
      />

      {error && <Text style={styles.serverError}>{error}</Text>}

      <AppButton
        label="Crear solicitud"
        onPress={handleSubmit(onSubmit)}
        loading={loadingAction}
        style={styles.submitBtn}
      />
    </ScrollView>
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
  loadingText: {
    color: colors.muted,
    fontSize: 14,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 20,
  },
  textarea: {
    textAlignVertical: 'top',
    minHeight: 100,
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
  submitBtn: {
    marginTop: 8,
  },
});
