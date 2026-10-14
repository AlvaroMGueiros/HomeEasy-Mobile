import { Feather } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export interface ChoiceOption<T extends string | number> { value: T; label: string; icon?: ComponentProps<typeof Feather>['name']; }

export function ChoiceChips<const T extends string | number>({ options, value, onChange, scrollable = false, segmented = false }: { options: Array<ChoiceOption<T>>; value: T; onChange(value: NoInfer<T>): void; scrollable?: boolean; segmented?: boolean }) {
  const choices = <View style={[styles.row, scrollable && styles.horizontalRow, segmented && styles.segmented]}>{options.map(option => <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: value === option.value }} onPress={() => onChange(option.value)} style={[styles.chip, segmented && styles.segment, value === option.value && styles.active]}>{option.icon && <Feather name={option.icon} size={20} color={value === option.value ? colors.white : colors.textMuted} />}<Text style={[styles.label, value === option.value && styles.activeLabel]}>{option.label}</Text></Pressable>)}</View>;
  if (scrollable) return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>{choices}</ScrollView>;
  return choices;
}

const styles = StyleSheet.create({ scroll: { flexGrow: 0 }, horizontalRow: { flexWrap: 'nowrap' }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, segmented: { flexWrap: 'nowrap', gap: 4, padding: 4, borderRadius: 30, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, segment: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 48, borderWidth: 0, paddingHorizontal: 8, borderRadius: 26 }, chip: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, active: { backgroundColor: colors.primary, borderColor: colors.primary }, label: { color: colors.textMuted, fontWeight: '700' }, activeLabel: { color: colors.white } });
