import { StyleSheet, Switch, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Schedule } from '../../types/api';
import { AppButton } from '../ui/AppButton';
import { TimePickerField } from '../ui/TimePickerField';

interface ProfessionalScheduleDayProps {
  label: string;
  periods: Schedule['periods'];
  disabled: boolean;
  onChange(periods: Schedule['periods']): void;
  weekday: number;
}

export function ProfessionalScheduleDay({ label, periods, disabled, onChange, weekday }: ProfessionalScheduleDayProps) {
  function updateTime(index: number, key: 'startTime' | 'endTime', value: string) {
    onChange(periods.map((period, periodIndex) => periodIndex === index ? { ...period, [key]: value } : period));
  }
  return <View style={styles.card}>
    <View style={styles.header}><View style={styles.heading}><Text style={styles.day}>{label}</Text><Text style={styles.hint}>{periods.length ? 'Disponível para atender' : 'Folga · sem atendimento'}</Text></View><Switch accessibilityLabel={`Atendimento em ${label}`} disabled={disabled} value={periods.length > 0} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} onValueChange={available => onChange(available ? [{ weekday, startTime: '08:00', endTime: '18:00' }] : [])} /></View>
    {periods.map((period, index) => <View key={index} style={styles.interval}>
      <View style={styles.times}><View style={styles.time}><TimePickerField label="Das" value={period.startTime} onChange={value => updateTime(index, 'startTime', value)} disabled={disabled} /></View><View style={styles.time}><TimePickerField label="Até" value={period.endTime} onChange={value => updateTime(index, 'endTime', value)} disabled={disabled} /></View></View>
      {periods.length > 1 && <AppButton label="Remover intervalo" variant="secondary" disabled={disabled} onPress={() => onChange(periods.filter((_, periodIndex) => periodIndex !== index))} />}
    </View>)}
    {periods.length > 0 && periods.length < 6 && <AppButton label="Adicionar intervalo" variant="secondary" disabled={disabled} onPress={() => onChange([...periods, { weekday, startTime: '', endTime: '' }])} />}
  </View>;
}

const styles = StyleSheet.create({ card: { gap: 14, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, heading: { flex: 1, gap: 4 }, day: { color: colors.text, fontWeight: '800', fontSize: 17 }, hint: { color: colors.textMuted, fontSize: 12 }, interval: { gap: 10 }, times: { flexDirection: 'row', gap: 12 }, time: { flex: 1 } });
