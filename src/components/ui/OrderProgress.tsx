import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Order } from '../../types/api';
import { resolveOrderProgress } from '../../utils/order-progress';

export function OrderProgress({ order }: { order: Order }) {
  const stages = resolveOrderProgress(order);
  if (!stages.length) return null;
  return <View style={styles.card}><Text style={styles.heading}>Acompanhe seu serviço</Text>{stages.map(stage => <View key={stage.status} style={styles.stage}>
    <View style={[styles.marker, (stage.completed || stage.current) && styles.activeMarker]}><Feather name={stage.completed ? 'check' : 'circle'} size={15} color={stage.completed || stage.current ? colors.white : colors.textMuted} /></View>
    <Text style={[styles.label, stage.current && styles.currentLabel]}>{stage.label}</Text>
    {stage.current && <Text style={styles.current}>Atual</Text>}
  </View>)}</View>;
}

const styles = StyleSheet.create({
  card: { gap: 16, padding: 17, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  heading: { color: colors.text, fontSize: 18, fontWeight: '900' },
  stage: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  marker: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  activeMarker: { backgroundColor: colors.primary },
  label: { flex: 1, color: colors.textMuted, fontSize: 14 },
  currentLabel: { color: colors.primary, fontWeight: '800' },
  current: { color: colors.primary, fontSize: 11, fontWeight: '800' }
});
