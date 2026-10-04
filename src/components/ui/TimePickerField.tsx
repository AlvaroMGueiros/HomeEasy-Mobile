import DateTimePicker from '@expo/ui/community/datetime-picker';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { formatTime, parseTime } from '../../utils/professionalSchedule';

export function TimePickerField({ label, value, onChange, disabled = false }: { label: string; value: string; onChange(value: string): void; disabled?: boolean }) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value || 'Escolher horário'}`} disabled={disabled} onPress={() => setIsPickerVisible(true)} style={styles.trigger}>
      <Feather name="clock" size={17} color={colors.primary} /><Text style={styles.value}>{value || 'Escolher'}</Text>
    </Pressable>
    {isPickerVisible && <DateTimePicker value={parseTime(value)} mode="time" display="clock" presentation="dialog" is24Hour accentColor={colors.primary} positiveButton={{ label: 'Confirmar' }} negativeButton={{ label: 'Cancelar' }} onValueChange={(_, selectedTime) => { onChange(formatTime(selectedTime)); setIsPickerVisible(false); }} onDismiss={() => setIsPickerVisible(false)} />}
  </View>;
}

const styles = StyleSheet.create({ field: { gap: 7 }, label: { color: colors.text, fontWeight: '800' }, trigger: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, value: { flex: 1, color: colors.text, fontSize: 15 } });
