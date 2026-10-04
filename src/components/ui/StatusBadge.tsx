import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { resolveStatusLabel, resolveStatusTone } from '../../utils/status';

const toneColors = { neutral: colors.textMuted, active: colors.primary, success: colors.success, warning: colors.warning, danger: colors.danger };

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = resolveStatusTone(status);
  return <View style={[styles.badge, tone === 'active' && styles.active, tone === 'success' && styles.success]}><Text style={[styles.label, { color: toneColors[tone] }]}>{label || resolveStatusLabel(status)}</Text></View>;
}

const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, backgroundColor: colors.background }, active: { backgroundColor: colors.primarySoft }, success: { backgroundColor: colors.successSoft }, label: { fontSize: 11, fontWeight: '800' } });
