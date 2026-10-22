import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { resolveProfessionalVerification } from '../../utils/professionalVerification';
import { AppText } from '../ui/AppText';
import { UserAvatar } from '../ui/UserAvatar';

export function HighlightAuthor({ professional, subtitle, onPress, onReviews }: { professional: Professional; subtitle?: string; onPress?(): void; onReviews?(): void }) {
  const verification = resolveProfessionalVerification(professional);
  const rating = professional.metrics?.averageRating;
  const reviewCount = professional.metrics?.verifiedReviewCount || 0;
  const identity = <>
    <UserAvatar name={professional.name} mediaId={professional.profilePhotoMediaId} size={46} />
    <View style={styles.copy}>
      <View style={styles.nameRow}><AppText style={styles.name} numberOfLines={2}>{professional.name}</AppText>{verification.identity && <Feather name="check-circle" size={15} color={colors.success} accessibilityLabel="Identidade verificada" />}</View>
      <View style={styles.meta}><Feather name="map-pin" size={12} color={colors.textMuted} /><AppText style={styles.subtitle}>{subtitle || [professional.city, professional.state].filter(Boolean).join(', ')}</AppText></View>
      {onReviews && <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${reviewCount} avaliações de ${professional.name}`} onPress={event => { event.stopPropagation(); onReviews(); }} style={styles.ratingRow}><Feather name="star" size={12} color={colors.warning} /><AppText style={styles.rating}>{rating ? `${rating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} (${reviewCount})` : 'Sem avaliações'}</AppText></Pressable>}
    </View>
  </>;
  if (!onPress) return <View style={styles.identity}>{identity}</View>;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver perfil de ${professional.name}`} onPress={onPress} style={styles.identity}>{identity}</Pressable>;
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  copy: { flex: 1, gap: 3 }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, name: { flexShrink: 1, color: colors.text, fontWeight: '800', fontSize: 15 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 }, subtitle: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 26, alignSelf: 'flex-start' }, rating: { color: colors.text, fontSize: 11, fontWeight: '600' },
});
