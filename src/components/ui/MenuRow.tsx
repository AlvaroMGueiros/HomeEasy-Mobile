import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export function MenuRow({ title, description, icon, onPress, destructive = false }: { title: string; description?: string; icon: keyof typeof Feather.glyphMap; onPress(): void; destructive?: boolean }) {
  const color = destructive ? colors.danger : colors.primary;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
    <View style={styles.icon}><Feather name={icon} size={20} color={color} /></View>
    <View style={styles.content}><Text style={[styles.title, destructive && styles.danger]}>{title}</Text>{description && <Text style={styles.description}>{description}</Text>}</View>
    <Feather name="chevron-right" size={18} color={colors.textMuted} />
  </Pressable>;
}

const styles = StyleSheet.create({ row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }, icon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }, content: { flex: 1, gap: 3 }, title: { color: colors.text, fontSize: 15, fontWeight: '700' }, description: { color: colors.textMuted, fontSize: 12, lineHeight: 17 }, pressed: { backgroundColor: colors.background }, danger: { color: colors.danger } });
