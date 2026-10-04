import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export enum ProfessionalProfileTab { About = 'about', Services = 'services', Reviews = 'reviews', Photos = 'photos' }

const tabs = [
  { value: ProfessionalProfileTab.About, label: 'Sobre' },
  { value: ProfessionalProfileTab.Services, label: 'Serviços' },
  { value: ProfessionalProfileTab.Reviews, label: 'Avaliações' },
  { value: ProfessionalProfileTab.Photos, label: 'Fotos' }
];

export function ProfessionalProfileTabs({ value, onChange }: { value: ProfessionalProfileTab; onChange(value: ProfessionalProfileTab): void }) {
  return <View style={styles.tabs} accessibilityRole="tablist">{tabs.map(tab => <Pressable key={tab.value} accessibilityRole="tab" accessibilityState={{ selected: value === tab.value }} onPress={() => onChange(tab.value)} style={[styles.tab, value === tab.value && styles.selected]}><Text style={[styles.label, value === tab.value && styles.selectedLabel]}>{tab.label}</Text></Pressable>)}</View>;
}

const styles = StyleSheet.create({ tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface }, tab: { flex: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.transparent }, selected: { borderBottomColor: colors.primary }, label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' }, selectedLabel: { color: colors.primary, fontWeight: '800' } });
