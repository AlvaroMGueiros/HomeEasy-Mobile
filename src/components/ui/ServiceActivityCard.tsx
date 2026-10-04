import { Feather } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { resolveServiceIcon } from '../../utils/service-icon';
import { StatusBadge } from './StatusBadge';

interface ServiceActivityCardProps {
  title: string;
  status: string;
  statusLabel?: string;
  description?: string;
  location?: string;
  summary: string;
  actionLabel: string;
  children?: ReactNode;
  onPress(): void;
}

export function ServiceActivityCard({ title, status, statusLabel, description, location, summary, actionLabel, children, onPress }: ServiceActivityCardProps) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${actionLabel}`} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    <View style={styles.header}><View style={styles.icon}><Feather name={resolveServiceIcon(title)} size={22} color={colors.primary} /></View><View style={styles.heading}><Text style={styles.title}>{title}</Text><StatusBadge status={status} label={statusLabel} /></View></View>
    {Boolean(description) && <Text style={styles.description} numberOfLines={2}>{description}</Text>}
    {Boolean(location) && <View style={styles.location}><Feather name="map-pin" size={14} color={colors.textMuted} /><Text style={styles.meta}>{location}</Text></View>}
    {children}
    <View style={styles.footer}><Text style={styles.summary}>{summary}</Text><View style={styles.action}><Text style={styles.actionLabel}>{actionLabel}</Text><Feather name="chevron-right" size={16} color={colors.primary} /></View></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 16, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.75 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  heading: { flex: 1, gap: 6 },
  title: { color: colors.text, fontSize: 17, lineHeight: 23, fontWeight: '800' },
  description: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  summary: { color: colors.text, fontSize: 12, fontWeight: '700' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 24 },
  actionLabel: { color: colors.primary, fontSize: 12, fontWeight: '800' }
});
