import DateTimePicker from '@expo/ui/community/datetime-picker';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { formatIsoDate, formatIsoDateForDisplay, parseIsoDate } from '../../utils/date';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange(value: string): void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePickerField({ label, value, onChange, minimumDate, maximumDate }: DatePickerFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const selectedDate = parseIsoDate(value) || minimumDate || new Date();

  function selectDate(date: Date) {
    onChange(formatIsoDate(date));
    setIsPickerVisible(false);
  }

  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityRole="button" onPress={() => setIsPickerVisible(true)} style={styles.trigger}>
      <Feather name="calendar" size={19} color={colors.primary} />
      <Text style={[styles.value, !value && styles.placeholder]}>{formatIsoDateForDisplay(value)}</Text>
      <Feather name="chevron-down" size={18} color={colors.textMuted} />
    </Pressable>
    {isPickerVisible && <DateTimePicker
      value={selectedDate}
      mode="date"
      display="calendar"
      presentation="dialog"
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      accentColor={colors.primary}
      positiveButton={{ label: 'Confirmar' }}
      negativeButton={{ label: 'Cancelar' }}
      onValueChange={(_, date) => selectDate(date)}
      onDismiss={() => setIsPickerVisible(false)}
    />}
  </View>;
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { color: colors.text, fontWeight: '800' },
  trigger: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  value: { flex: 1, color: colors.text, fontSize: 15 },
  placeholder: { color: colors.textMuted }
});
