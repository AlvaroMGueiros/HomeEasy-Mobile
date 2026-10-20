import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from './AppText';
import { colors } from '../../theme/colors';
import { resolveStatusLabel, resolveStatusTone } from '../../utils/status';

const toneColors = { neutral: colors.textMuted, active: colors.primary, success: colors.success, warning: colors.warning, danger: colors.danger };

export function StatusBadge({ status, label, emphasized = false }: { status: string; label?: string; emphasized?: boolean }) {
  const tone = resolveStatusTone(status);
  return <View style={[styles.badge, tone === 'active' && styles.active, tone === 'success' && styles.success, emphasized && styles.emphasized, emphasized && tone === 'warning' && styles.warning]}>{emphasized && tone === 'success' && <Feather name="check-circle" size={14} color={toneColors[tone]} />}{emphasized && tone === 'warning' && <Feather name="clock" size={14} color={toneColors[tone]} />}<Text style={[styles.label, emphasized && styles.emphasizedLabel, { color: toneColors[tone] }]}>{label || resolveStatusLabel(status)}</Text></View>;
}

const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, backgroundColor: colors.background }, emphasized: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6 }, emphasizedLabel: { fontSize: 12 }, warning: { backgroundColor: colors.warningSoft }, active: { backgroundColor: colors.primarySoft }, success: { backgroundColor: colors.successSoft }, label: { fontSize: 11, fontWeight: '800' } });
