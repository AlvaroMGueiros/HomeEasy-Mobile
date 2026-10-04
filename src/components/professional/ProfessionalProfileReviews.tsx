import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { ProfessionalReviewsResponse } from '../../types/api';
import { StateView } from '../ui/StateView';
import { ProfessionalReviewCard } from './ProfessionalReviewCard';

export function ProfessionalProfileReviews({ response, loading, error, preview = false, onRetry, onViewAll }: { response: ProfessionalReviewsResponse | null; loading: boolean; error: string; preview?: boolean; onRetry(): void; onViewAll(): void }) {
  const visibleReviews = preview ? response?.reviews.slice(0, 2) : response?.reviews;
  return <View style={styles.container}>
    <View style={styles.header}><Text style={styles.title}>{preview ? 'Avaliações de clientes' : 'Avaliações'}</Text>{Boolean(response?.total) && <Pressable onPress={onViewAll} style={styles.link} accessibilityRole="button"><Text style={styles.linkText}>Ver todas</Text><Feather name="chevron-right" size={15} color={colors.primary} /></Pressable>}</View>
    {loading && !response && <StateView loading message="Carregando avaliações..." />}
    {Boolean(error) && <StateView icon="wifi-off" message={error} onAction={onRetry} />}
    {!loading && !error && response && !response.reviews.length && <View style={styles.empty}><Feather name="star" size={22} color={colors.warning} /><View style={styles.emptyContent}><Text style={styles.emptyTitle}>As primeiras avaliações estão por vir</Text><Text style={styles.emptyText}>Clientes podem avaliar após concluir um serviço pela Home Easy.</Text></View></View>}
    {!error && visibleReviews?.map(review => <ProfessionalReviewCard key={review.id} review={review} />)}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: 12 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, title: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '800' }, link: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 3 }, linkText: { color: colors.primary, fontSize: 12, fontWeight: '700' }, empty: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, emptyContent: { flex: 1, gap: 5 }, emptyTitle: { color: colors.text, fontSize: 13, fontWeight: '700' }, emptyText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 } });
