import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { UserAvatar } from '../components/ui/UserAvatar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { ProfessionalReviewsResponse } from '../types/api';
import { formatDate } from '../utils/date';

export function ProfessionalReviewsScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'ProfessionalReviews'>>();
  const [reviewResponse, setReviewResponse] = useState<ProfessionalReviewsResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<ProfessionalReviewsResponse>(`/professionals/${params.professionalId}/reviews`)
      .then(setReviewResponse)
      .catch(currentError => setError(currentError instanceof Error ? currentError.message : 'Não foi possível carregar as avaliações.'));
  }, [params.professionalId]);

  if (!reviewResponse) return <Screen><StateView loading={!error} message={error || 'Carregando avaliações...'} /></Screen>;

  return <Screen>
    <SectionHeader eyebrow="Reputação" title={`Avaliações de ${params.professionalName}`} description="Experiências verificadas de clientes que concluíram um serviço." />
    <View style={styles.summary}><Text style={styles.average}>{reviewResponse.ratingAverage ? reviewResponse.ratingAverage.toFixed(1) : '—'}</Text><View><Text style={styles.stars}>★★★★★</Text><Text style={styles.total}>{reviewResponse.total} avaliação(ões)</Text></View></View>
    {!reviewResponse.reviews.length && <View style={styles.empty}><Text style={styles.emptyTitle}>Ainda não há avaliações</Text><Text style={styles.emptyText}>As experiências dos clientes aparecerão depois dos primeiros serviços concluídos.</Text></View>}
    {reviewResponse.reviews.map(review => <View key={review.id} style={styles.card}>
      <View style={styles.header}><UserAvatar name={review.clientName} size={44} /><View style={styles.grow}><Text style={styles.clientName}>{review.clientName}</Text><Text style={styles.date}>Publicado em {formatDate(review.createdAt)}</Text></View><Text style={styles.rating}>★ {review.rating}</Text></View>
      <Text style={styles.comment}>{review.comment}</Text>
      {Boolean(review.professionalResponse) && <View style={styles.response}><Text style={styles.responseLabel}>Resposta do profissional</Text><Text style={styles.responseText}>{review.professionalResponse}</Text></View>}
    </View>)}
  </Screen>;
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, average: { color: colors.primary, fontSize: 38, fontWeight: '900' }, stars: { color: colors.warning, letterSpacing: 2 }, total: { color: colors.textMuted, marginTop: 3 },
  card: { gap: 14, padding: 17, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, header: { flexDirection: 'row', alignItems: 'center', gap: 10 }, grow: { flex: 1 }, clientName: { color: colors.text, fontSize: 16, fontWeight: '800' }, date: { color: colors.textMuted, fontSize: 12 }, rating: { color: colors.warning, fontSize: 16, fontWeight: '900' }, comment: { color: colors.text, lineHeight: 21 },
  response: { gap: 5, padding: 13, borderRadius: 14, backgroundColor: colors.background }, responseLabel: { color: colors.primary, fontSize: 12, fontWeight: '900' }, responseText: { color: colors.textMuted, lineHeight: 20 },
  empty: { alignItems: 'center', gap: 7, padding: 24, borderRadius: 18, backgroundColor: colors.surface }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' }, emptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 }
});
