import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../../api/api-client';
import { colors } from '../../theme/colors';
import { OrderDetail } from '../../types/api';
import { formatAppointment } from '../../utils/date';
import { AppButton } from '../ui/AppButton';
import { ChoiceChips } from '../ui/ChoiceChips';
import { FormField } from '../ui/FormField';

export function OrderReviewPanel({ orderId, review, isClient, onPublished }: { orderId: string; review: OrderDetail['review']; isClient: boolean; onPublished(review: NonNullable<OrderDetail['review']>): void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [publishing, setPublishing] = useState(false);

  async function publishReview() {
    if (publishing) return;
    if (comment.trim().length < 10) { Alert.alert('Conte sua experiência', 'Escreva pelo menos 10 caracteres para avaliar este serviço.'); return; }
    setPublishing(true);
    try {
      const publishedReview = await apiRequest<NonNullable<OrderDetail['review']>>(`/orders/${orderId}/reviews`, { method: 'POST', body: JSON.stringify({ rating, comment: comment.trim() }) });
      onPublished(publishedReview);
      Alert.alert('Avaliação publicada', 'Sua experiência foi registrada neste atendimento.');
    } catch (failure) { Alert.alert('Avaliação não publicada', failure instanceof Error ? failure.message : 'Não foi possível publicar a avaliação deste serviço.'); }
    finally { setPublishing(false); }
  }

  if (!review && !isClient) return null;
  return <View style={styles.card}>
    {review ? <><Text style={styles.heading}>{isClient ? 'Sua avaliação' : 'Avaliação do cliente'}</Text><Text style={styles.rating}>{'★'.repeat(review.rating)} · {review.rating}/5</Text><Text style={styles.comment}>{review.comment}</Text><Text style={styles.date}>{formatAppointment(review.createdAt)}</Text></> : <><Text style={styles.heading}>Como foi o atendimento?</Text><Text style={styles.comment}>Sua avaliação ajuda outros clientes a conhecerem este profissional.</Text><ChoiceChips value={rating} onChange={setRating} options={[1, 2, 3, 4, 5].map(value => ({ value, label: `${value} ★` }))} /><FormField label="Conte sua experiência" value={comment} onChangeText={setComment} multiline maxLength={2000} editable={!publishing} /><AppButton label="Publicar avaliação" onPress={() => void publishReview()} loading={publishing} /></>}
  </View>;
}

const styles = StyleSheet.create({ card: { gap: 14, padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, heading: { color: colors.text, fontSize: 17, fontWeight: '800' }, rating: { color: colors.warning, fontSize: 16, fontWeight: '800' }, comment: { color: colors.textMuted, fontSize: 13, lineHeight: 20 }, date: { color: colors.textMuted, fontSize: 12 } });
