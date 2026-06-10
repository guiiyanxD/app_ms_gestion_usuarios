import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from './theme';

interface PickerOption {
  readonly label: string;
  readonly value: string | number;
}

interface Props {
  readonly label: string;
  readonly options: readonly PickerOption[];
  readonly selectedValue: string | number;
  readonly onValueChange: (value: string | number) => void;
  readonly error?: string;
}

export default function AppPicker({
  label,
  options,
  selectedValue,
  onValueChange,
  error,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerWrapper, error && styles.pickerError]}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
          {options.map((opt) => (
            <Picker.Item key={String(opt.value)} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  pickerError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
