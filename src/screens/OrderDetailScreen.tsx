import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Conversation, Order } from '../types/api';
import { formatCurrency } from '../utils/currency';
import { resolveStatusLabel } from '../utils/status';

export function OrderDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadOrder(); }, [params.orderId]);

  async function loadOrder() {
    try {
      const [orders, conversations] = await Promise.all([
        apiRequest<Order[]>('/marketplace/orders/me'),
        apiRequest<Conversation[]>('/conversations')
      ]);
      const currentOrder = orders.find(orderItem => orderItem.id === params.orderId);
      if (!currentOrder) {
        setError('Pedido não encontrado.');
        return;
      }
      setOrder(currentOrder);
      setConversation(conversations.find(conversationItem => conversationItem.orderId === params.orderId) || null);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Não foi possível carregar o pedido.');
    }
  }

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      await apiRequest(`/marketplace/orders/${params.orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await loadOrder();
    } catch (currentError) {
      Alert.alert('Não foi possível atualizar', currentError instanceof Error ? currentError.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function cancel() {
    Alert.alert('Cancelar pedido?', 'O cancelamento ficará registrado no histórico.', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Cancelar pedido', style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          await apiRequest(`/marketplace/orders/${params.orderId}/cancel`, { method: 'POST', body: JSON.stringify({ reason: 'other', details: 'Cancelado pelo aplicativo mobile.' }) });
          await loadOrder();
        } catch (currentError) {
          Alert.alert('Não foi possível cancelar', currentError instanceof Error ? currentError.message : 'Tente novamente.');
        } finally {
          setLoading(false);
        }
      } }
    ]);
  }

  function openConversation() {
    if (!conversation) {
      Alert.alert('Conversa indisponível', 'Não foi possível localizar a conversa deste serviço.');
      return;
    }
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      otherUserId: conversation.otherUser.id,
      otherUserName: conversation.otherUser.name,
      serviceName: conversation.service.name,
      isWritable: conversation.isWritable
    });
  }

  async function review() {
    if (comment.trim().length < 10) {
      Alert.alert('Conte sua experiência', 'Escreva pelo menos 10 caracteres.');
      return;
    }
    try {
      await apiRequest(`/orders/${params.orderId}/reviews`, { method: 'POST', body: JSON.stringify({ rating, comment: comment.trim() }) });
      Alert.alert('Avaliação publicada', 'Obrigado por compartilhar sua experiência.');
      setComment('');
    } catch (currentError) {
      Alert.alert('Não foi possível avaliar', currentError instanceof Error ? currentError.message : 'Tente novamente.');
    }
  }

  async function rehire() {
    try {
      await apiRequest(`/marketplace/orders/${params.orderId}/rehire`, { method: 'POST' });
      Alert.alert('Solicitação criada', 'O profissional receberá um novo pedido direcionado.');
    } catch (currentError) {
      Alert.alert('Não foi possível recontratar', currentError instanceof Error ? currentError.message : 'Tente novamente.');
    }
  }

  if (!order) return <Screen><StateView loading={!error} message={error || 'Carregando pedido...'} /></Screen>;
  const isClient = order.clientId === user?.id;
  const isFinished = ['completed', 'cancelled_by_client', 'cancelled_by_professional'].includes(order.status);

  return <Screen>
    <SectionHeader eyebrow={resolveStatusLabel(order.status)} title={order.request.service?.name || 'Pedido'} description={order.request.description} />
    <View style={styles.card}><Text style={styles.price}>{formatCurrency(Number(order.agreedPrice))}</Text><Text style={styles.line}>Local: {order.request.city}/{order.request.state}</Text>{Boolean(order.scheduledAt) && <Text style={styles.line}>Agendado: {new Date(order.scheduledAt || '').toLocaleString('pt-BR')}</Text>}</View>
    {conversation && <AppButton label={conversation.isWritable ? 'Abrir chat' : 'Ver histórico da conversa'} onPress={openConversation} />}
    {!isFinished && <>
      {isClient && order.status === 'accepted' && <AppButton label="Confirmar agendamento" onPress={() => updateStatus('scheduled')} loading={loading} />}
      {!isClient && ['accepted', 'scheduled'].includes(order.status) && <AppButton label="Iniciar serviço" onPress={() => updateStatus('in_progress')} loading={loading} />}
      {!isClient && order.status === 'in_progress' && <AppButton label="Marcar como concluído" onPress={() => updateStatus('completed')} loading={loading} />}
      <AppButton label="Cancelar pedido" variant="secondary" onPress={cancel} loading={loading} />
    </>}
    {isClient && order.status === 'completed' && <View style={styles.card}><Text style={styles.heading}>Avaliar atendimento</Text><ChoiceChips value={rating} onChange={setRating} options={[1, 2, 3, 4, 5].map(value => ({ value, label: `${value} ★` }))} /><FormField label="Comentário" value={comment} onChangeText={setComment} multiline /><AppButton label="Publicar avaliação" onPress={review} /><AppButton label="Recontratar" variant="secondary" onPress={rehire} /></View>}
    {!['cancelled_by_client', 'cancelled_by_professional', 'disputed'].includes(order.status) && <AppButton label="Abrir disputa" variant="secondary" onPress={() => navigation.navigate('Dispute', { orderId: order.id })} />}
  </Screen>;
}

const styles = StyleSheet.create({ card: { gap: 12, padding: 17, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, price: { color: colors.primary, fontSize: 24, fontWeight: '900' }, line: { color: colors.textMuted }, heading: { color: colors.text, fontSize: 18, fontWeight: '900' } });
