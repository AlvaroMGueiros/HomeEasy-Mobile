import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Order, ProfessionalReview } from '../../types/api';
import { resolveOrderProgress } from '../../utils/order-progress';

export function OrderProgress({ order, review }: { order: Order; review?: Pick<ProfessionalReview, 'createdAt'> | null }) {
  const stages = resolveOrderProgress(order, review);
  if (!stages.length) return null;
  return <View style={styles.card}><Text style={styles.heading}>Acompanhe seu serviço</Text>{stages.map((stage, index) => <View key={stage.status} style={styles.stage}>
    <View style={styles.rail}>{index < stages.length - 1 && <View style={[styles.connector, stage.completed && styles.completedConnector]} />}<View style={[styles.marker, (stage.completed || stage.current) && styles.activeMarker]}><Feather name={stage.completed ? 'check' : stage.icon} size={15} color={stage.completed || stage.current ? colors.white : colors.textMuted} /></View></View>
    <View style={styles.stageCopy}><View style={styles.labelRow}><Text style={[styles.label, (stage.current || stage.completed) && styles.currentLabel]}>{stage.label}</Text>{stage.current && <Text style={styles.current}>Atual</Text>}</View><Text style={styles.description}>{stage.description}</Text></View>
  </View>)}</View>;
}

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  heading: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 18 },
  stage: { flexDirection: 'row', gap: 12, minHeight: 64 },
  rail: { width: 28, alignItems: 'center' },
  connector: { position: 'absolute', top: 28, bottom: 0, width: 2, backgroundColor: colors.border },
  completedConnector: { backgroundColor: colors.coverAccent },
  stageCopy: { flex: 1, gap: 5, paddingBottom: 16 },
  labelRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  description: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  marker: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  activeMarker: { backgroundColor: colors.primary },
  label: { flex: 1, color: colors.textMuted, fontSize: 14 },
  currentLabel: { color: colors.primary, fontWeight: '800' },
  current: { color: colors.primary, fontSize: 11, fontWeight: '800' }
});
