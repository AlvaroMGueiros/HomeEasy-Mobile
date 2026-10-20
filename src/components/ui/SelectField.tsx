import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText as Text } from './AppText';
import { colors } from '../../theme/colors';
import { normalizeSearchText } from '../../utils/service-search';
import { ChoiceOption } from './ChoiceChips';
import { SearchField } from './SearchField';
import { FieldLabel } from './FieldLabel';

interface SelectFieldProps {
  label: string;
  value: string;
  options: ChoiceOption<string>[];
  onChange(value: string): void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  searchable?: boolean;
  disabled?: boolean;
}

export function SelectField({ label, value, options, onChange, placeholder = 'Selecione uma opção', hint, required = false, searchable = false, disabled = false }: SelectFieldProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedOption = options.find(option => option.value === value);
  const filteredOptions = useMemo(() => {
    const search = normalizeSearchText(searchTerm);
    if (!search) return options;
    return options.filter(option => normalizeSearchText(`${option.label} ${option.value}`).includes(search));
  }, [options, searchTerm]);
  const fieldLabel = required ? `${label} (obrigatório)` : label;

  function close() { setVisible(false); setSearchTerm(''); }

  return <View style={styles.field}>
    <FieldLabel label={label} required={required} style={styles.label} />
    <Pressable accessibilityRole="button" accessibilityLabel={`${fieldLabel}: ${selectedOption?.label || placeholder}`} accessibilityHint={hint} accessibilityState={{ expanded: visible, disabled }} disabled={disabled} onPress={() => setVisible(true)} style={styles.trigger}>
      <Text style={[styles.value, !selectedOption && styles.placeholder]}>{selectedOption?.label || placeholder}</Text>
      <Feather name="chevron-down" size={18} color={colors.textMuted} />
    </Pressable>
    {hint && <Text style={styles.hint}>{hint}</Text>}
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={[styles.overlay, { paddingTop: Math.max(insets.top, 20) }]}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Fechar opções" onPress={close} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel="Fechar opções" onPress={close} style={styles.close}><Feather name="x" size={24} color={colors.primary} /></Pressable></View>
          {searchable && <SearchField value={searchTerm} onChangeText={setSearchTerm} placeholder="Digite para encontrar uma opção" />}
          <FlatList data={filteredOptions} keyExtractor={option => option.value} keyboardShouldPersistTaps="handled" style={styles.options} ListEmptyComponent={<Text style={styles.hint}>Nenhuma opção encontrada. Tente outro nome.</Text>} renderItem={({ item: option }) => <Pressable accessibilityRole="radio" accessibilityState={{ selected: option.value === value }} onPress={() => { onChange(option.value); close(); }} style={styles.option}>
            <Text style={styles.value}>{option.label}</Text>{option.value === value && <Feather name="check" size={20} color={colors.primary} />}
          </Pressable>} />
        </View>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  field: { gap: 7 }, label: { color: colors.text, fontWeight: '800' },
  trigger: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  value: { flex: 1, color: colors.text, fontSize: 15 }, placeholder: { color: colors.textMuted },
  hint: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { maxHeight: '85%', padding: 20, gap: 14, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { flex: 1, color: colors.text, fontSize: 20, fontWeight: '800' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, options: { flexGrow: 0 },
  option: { minHeight: 52, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }
});
