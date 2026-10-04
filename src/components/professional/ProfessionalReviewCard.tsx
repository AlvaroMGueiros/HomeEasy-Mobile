import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { ProfessionalReview } from '../../types/api';
import { formatDate } from '../../utils/date';
import { UserAvatar } from '../ui/UserAvatar';

export function ProfessionalReviewCard({ review }: { review: ProfessionalReview }) {
  return <View style={styles.card}>
    <View style={styles.header}>
      <UserAvatar name={review.clientName} size={38} />
      <View style={styles.content}><Text style={styles.name}>{review.clientName}</Text><View style={styles.meta}><Feather name="star" size={12} color={colors.warning} /><Text style={styles.rating}>{review.rating.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</Text><Text style={styles.date}>· {formatDate(review.createdAt)}</Text></View></View>
      <Feather name="check-circle" size={15} color={colors.success} accessibilityLabel="Avaliação de serviço concluído" />
    </View>
    <Text style={styles.comment}>{review.comment}</Text>
    {Boolean(review.professionalResponse) && <View style={styles.response}><Text style={styles.responseLabel}>Resposta do profissional</Text><Text style={styles.responseText}>{review.professionalResponse}</Text></View>}
  </View>;
}

const styles = StyleSheet.create({ card: { gap: 12, padding: 16, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, header: { flexDirection: 'row', alignItems: 'center', gap: 10 }, content: { flex: 1, gap: 4 }, name: { color: colors.text, fontSize: 14, fontWeight: '800' }, meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }, rating: { color: colors.warning, fontSize: 12, fontWeight: '800' }, date: { color: colors.textMuted, fontSize: 11 }, comment: { color: colors.text, fontSize: 14, lineHeight: 21 }, response: { gap: 5, padding: 12, borderRadius: 12, backgroundColor: colors.background }, responseLabel: { color: colors.primary, fontSize: 12, fontWeight: '800' }, responseText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 } });
