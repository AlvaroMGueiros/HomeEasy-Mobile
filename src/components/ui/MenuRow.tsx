import { AppIcon, type IconName } from './AppIcon';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText as Text } from './AppText';
import { colors } from '../../theme/colors';

export function MenuRow({ title, description, icon, onPress, destructive = false }: { title: string; description?: string; icon: IconName; onPress(): void; destructive?: boolean }) {
  const color = destructive ? colors.danger : colors.primary;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
    <View style={styles.icon}><AppIcon name={icon} size={20} color={color} /></View>
    <View style={styles.content}><Text style={[styles.title, destructive && styles.danger]}>{title}</Text>{description && <Text style={styles.description}>{description}</Text>}</View>
    <AppIcon name="chevron-right" size={18} color={colors.textMuted} />
  </Pressable>;
}

const styles = StyleSheet.create({ row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }, icon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }, content: { flex: 1, gap: 3 }, title: { color: colors.text, fontSize: 15, fontWeight: '700' }, description: { color: colors.textMuted, fontSize: 12, lineHeight: 17 }, pressed: { backgroundColor: colors.background }, danger: { color: colors.danger } });
