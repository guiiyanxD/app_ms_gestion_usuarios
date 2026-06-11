import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from './theme';

export interface SearchableOption {
  readonly id: string;
  readonly label: string;
}

interface Props {
  readonly label: string;
  readonly options: readonly SearchableOption[];
  readonly value: string;
  readonly onSelect: (id: string) => void;
  readonly placeholder?: string;
  readonly error?: string;
}

const MAX_VISIBLE = 15;

export default function AppSearchableSelect({
  label,
  options,
  value,
  onSelect,
  placeholder = 'Buscar...',
  error,
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((o) => o.id === value)?.label ?? '',
    [options, value],
  );

  // Computed directly — no useMemo to avoid stale closure edge cases
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, MAX_VISIBLE)
    : options.slice(0, MAX_VISIBLE);

  const openDropdown = () => {
    setQuery('');
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
    setQuery('');
  };

  const handleSelect = (option: SearchableOption) => {
    onSelect(option.id);
    closeDropdown();
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputRow, open && styles.inputRowOpen, !!error && styles.inputRowError]}>
        <TextInput
          style={styles.input}
          value={open ? query : selectedLabel}
          onChangeText={(text) => {
            setQuery(text);
            if (!open) setOpen(true);
          }}
          onFocus={openDropdown}
          placeholder={open ? placeholder : (selectedLabel || placeholder)}
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          blurOnSubmit={false}
        />
        {open ? (
          <TouchableOpacity onPress={closeDropdown} style={styles.sideBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.sideBtnText}>✕</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={openDropdown} style={styles.sideBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.sideBtnText}>▾</Text>
          </TouchableOpacity>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {open && (
        <View style={styles.dropdown}>
          {filtered.length === 0 ? (
            <Text style={styles.noResults}>Sin resultados para "{query}"</Text>
          ) : (
            filtered.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.option, opt.id === value && styles.optionSelected]}
                onPress={() => handleSelect(opt)}
                activeOpacity={0.6}
              >
                <Text style={[styles.optionText, opt.id === value && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  inputRowOpen: {
    borderColor: colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink,
  },
  sideBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sideBtnText: {
    fontSize: 14,
    color: colors.muted,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.primary,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    fontSize: 14,
    color: colors.ink,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  noResults: {
    padding: 12,
    fontSize: 14,
    color: colors.muted,
    fontStyle: 'italic',
  },
});
