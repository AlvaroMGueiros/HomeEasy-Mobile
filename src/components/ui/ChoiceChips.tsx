import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export interface ChoiceOption<T extends string | number> { value: T; label: string; }

export function ChoiceChips<const T extends string | number>({ options, value, onChange }: { options: Array<ChoiceOption<T>>; value: T; onChange(value: NoInfer<T>): void }) {
  return <View style={styles.row}>{options.map(option => <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.chip, value === option.value && styles.active]}><Text style={[styles.label, value === option.value && styles.activeLabel]}>{option.label}</Text></Pressable>)}</View>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, active: { backgroundColor: colors.primary, borderColor: colors.primary }, label: { color: colors.textMuted, fontWeight: '700' }, activeLabel: { color: colors.white } });
