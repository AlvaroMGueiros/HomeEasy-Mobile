import { AppIcon, type IconName } from './AppIcon';
import { ComponentProps } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Pressable } from './Pressable';

import { AppText as Text } from './AppText';
import { colors } from '../../theme/colors';

export interface ChoiceOption<T extends string | number> { value: T; label: string; icon?: IconName; }

export function ChoiceChips<const T extends string | number>({ options, value, onChange, scrollable = false, segmented = false, compact = false, tabs = false }: { options: Array<ChoiceOption<T>>; value: T; onChange(value: NoInfer<T>): void; scrollable?: boolean; segmented?: boolean; compact?: boolean; tabs?: boolean }) {
  if (tabs) return <View accessibilityRole="tablist" style={styles.tabs}>{options.map(option => {
    const selected = value === option.value;
    return <Pressable key={option.value} feedback="opacity" accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onChange(option.value)} style={[styles.tab, selected && styles.tabActive]}>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.tabLabel, selected && styles.tabLabelActive]}>{option.label}</Text>
    </Pressable>;
  })}</View>;
  const choices = <View style={[styles.row, scrollable && styles.horizontalRow, segmented && styles.segmented]}>{options.map(option => <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: value === option.value }} onPress={() => onChange(option.value)} hitSlop={compact ? { top: 4, bottom: 4 } : undefined} style={[styles.chip, segmented && styles.segment, compact && styles.compact, value === option.value && styles.active]}>{option.icon && <AppIcon name={option.icon} size={compact ? 15 : 20} color={value === option.value ? colors.white : colors.textMuted} />}<Text numberOfLines={compact ? 1 : undefined} style={[styles.label, compact && styles.compactLabel, value === option.value && styles.activeLabel]}>{option.label}</Text></Pressable>)}</View>;
  if (scrollable) return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>{choices}</ScrollView>;
  return choices;
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 }, horizontalRow: { flexWrap: 'nowrap' }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmented: { flexWrap: 'nowrap', gap: 4, padding: 4, borderRadius: 30, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, segment: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, borderWidth: 0, paddingHorizontal: 8, borderRadius: 26 },
  chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, compact: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, marginBottom: -1, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary }, tabLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '600' }, tabLabelActive: { color: colors.primary },
  active: { backgroundColor: colors.primary, borderColor: colors.primary }, label: { color: colors.textMuted, fontWeight: '700' }, compactLabel: { fontSize: 12, fontWeight: '600' }, activeLabel: { color: colors.white },
});
