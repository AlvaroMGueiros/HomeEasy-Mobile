import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { ProfessionalReviewCard } from '../components/professional/ProfessionalReviewCard';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { ProfessionalReviewsResponse } from '../types/api';

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
    <View style={styles.summary}><Text style={styles.average}>{reviewResponse.ratingAverage ? reviewResponse.ratingAverage.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'}</Text><View><Text style={styles.summaryLabel}>Avaliação média</Text><Text style={styles.total}>{reviewResponse.total} {reviewResponse.total === 1 ? 'avaliação' : 'avaliações'}</Text></View></View>
    {!reviewResponse.reviews.length && <View style={styles.empty}><Text style={styles.emptyTitle}>Ainda não há avaliações</Text><Text style={styles.emptyText}>As experiências dos clientes aparecerão depois dos primeiros serviços concluídos.</Text></View>}
    {reviewResponse.reviews.map(review => <ProfessionalReviewCard key={review.id} review={review} />)}
  </Screen>;
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, average: { color: colors.primary, fontSize: 38, fontWeight: '900' }, summaryLabel: { color: colors.text, fontWeight: '700' }, total: { color: colors.textMuted, marginTop: 3 },
  empty: { alignItems: 'center', gap: 7, padding: 24, borderRadius: 18, backgroundColor: colors.surface }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' }, emptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 }
});
