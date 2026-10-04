import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '../ui/UserAvatar';
import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { resolveProfessionalProfileSummary } from '../../utils/professional-profile';
import { ProfessionalReputation } from './ProfessionalReputation';

export function ProfessionalDiscoveryCard({ professional, expanded, onPress }: { professional: Professional; expanded: boolean; onPress(): void }) {
  const summary = resolveProfessionalProfileSummary(professional);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver perfil de ${professional.name}`} style={[styles.card, expanded && styles.expanded]} onPress={onPress}>
    <View style={styles.header}><UserAvatar name={professional.name} mediaId={professional.profilePhotoMediaId} size={52} /><View style={styles.identity}><Text style={styles.name} numberOfLines={1}>{professional.name}</Text><Text style={styles.meta} numberOfLines={2}>{summary.specialty}</Text></View></View>
    <ProfessionalReputation professional={professional} compact />
    <Text style={styles.meta} numberOfLines={1}>{summary.location}</Text>
    <View style={styles.footer}><Text style={styles.price}>{summary.priceLabel}</Text><Feather name="arrow-right" size={18} color={colors.primary} /></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { width: 268, gap: 10, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  expanded: { width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  identity: { flex: 1, gap: 4 },
  name: { color: colors.text, fontSize: 15, fontWeight: '900' },
  meta: { color: colors.textMuted, fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  price: { flex: 1, color: colors.primary, fontSize: 13, fontWeight: '800' }
});
