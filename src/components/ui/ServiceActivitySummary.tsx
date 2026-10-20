import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from './AppText';
import { colors } from '../../theme/colors';

export function ServiceActivitySummary({ attentionCount, completedCount }: { attentionCount: number; completedCount: number }) {
  return <View style={styles.row}>{[
    { key: 'attention', title: 'Precisam de atenção', count: attentionCount, icon: 'clock' as const, success: false },
    { key: 'completed', title: 'Concluídos', count: completedCount, icon: 'check-circle' as const, success: true }
  ].map(summary => <View key={summary.key} style={[styles.card, summary.success && styles.successCard]}>
    <View style={styles.top}><View style={[styles.icon, summary.success && styles.successIcon]}><Feather name={summary.icon} size={22} color={summary.success ? colors.success : colors.warning} /></View><Text style={[styles.count, summary.success && styles.successCount]}>{summary.count}</Text></View>
    <Text style={styles.title}>{summary.title}</Text>
  </View>)}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: { flex: 1, padding: 13, gap: 7, borderRadius: 18, borderWidth: 1, borderColor: colors.warningBorder, backgroundColor: colors.warningSurface },
  successCard: { borderColor: colors.coverAccent, backgroundColor: colors.successSurface },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center' },
  successIcon: { backgroundColor: colors.successSoft },
  count: { color: colors.warning, fontSize: 17, fontWeight: '800' },
  successCount: { color: colors.success },
  title: { color: colors.text, fontSize: 13, fontWeight: '800' }
});
