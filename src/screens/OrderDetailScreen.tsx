import { Feather } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { CompletedOrderPhotos } from '../components/professional/CompletedOrderPhotos';
import { OrderAgreementDetails } from '../components/professional/OrderAgreementDetails';
import { OrderParticipantSummary } from '../components/professional/OrderParticipantSummary';
import { OrderReviewPanel } from '../components/professional/OrderReviewPanel';
import { OrderServiceSummary } from '../components/professional/OrderServiceSummary';
import { AppButton } from '../components/ui/AppButton';
import { OrderProgress } from '../components/ui/OrderProgress';
import { Screen } from '../components/ui/Screen';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Conversation, Dispute, Order, OrderDetail, OrderStatus } from '../types/api';
import { formatCurrency } from '../utils/currency';
import { isOrderClosed, resolveOrderStatusDescription } from '../utils/orderDetails';
import { resolveEnumLabel, resolveStatusLabel } from '../utils/status';

export function OrderDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [chatError, setChatError] = useState('');
  const [disputeError, setDisputeError] = useState('');
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const mutationVersion = useRef(0);
  const pendingOrderId = useRef<string | null>(null);
  const currentOrderId = useRef(params.orderId);
  const focused = useRef(false);
  const currentOrder = useRef(order);
  const updatingOrder = useRef(loading);
  currentOrderId.current = params.orderId;
  currentOrder.current = order;
  updatingOrder.current = loading;

  const loadOrder = useCallback(async (showRefreshing = false) => {
    const orderId = params.orderId;
    const requestVersion = mutationVersion.current;
    if (pendingOrderId.current === orderId) return;
    pendingOrderId.current = orderId;
    if (showRefreshing) setRefreshing(true);
    try {
      const [orderResponse, conversationsResponse] = await Promise.allSettled([
        apiRequest<OrderDetail>(`/marketplace/orders/${orderId}`),
        apiRequest<Conversation[]>('/conversations')
      ]);
      if (currentOrderId.current !== orderId || !focused.current || requestVersion !== mutationVersion.current) return;
      if (orderResponse.status === 'rejected') throw orderResponse.reason;
      setOrder(orderResponse.value); setError('');
      if (conversationsResponse.status === 'fulfilled') {
        setConversation(conversationsResponse.value.find(currentConversation => currentConversation.orderId === orderId) || null); setChatError('');
      } else { setConversation(null); setChatError('Não foi possível consultar a conversa deste serviço. Atualize a página para tentar novamente.'); }
      if (orderResponse.value.status === OrderStatus.Disputed) {
        try {
          const currentDispute = await apiRequest<Dispute>(`/orders/${orderId}/dispute`);
          if (currentOrderId.current === orderId && focused.current && requestVersion === mutationVersion.current) { setDispute(currentDispute); setDisputeError(''); }
        } catch (failure) { if (currentOrderId.current === orderId && focused.current) setDisputeError(failure instanceof Error ? failure.message : 'Não foi possível consultar os detalhes da disputa.'); }
      } else { setDispute(null); setDisputeError(''); }
    } catch (failure) { if (currentOrderId.current === orderId && focused.current) setError(failure instanceof Error ? failure.message : 'Não foi possível carregar os detalhes deste pedido.'); }
    finally { if (pendingOrderId.current === orderId) pendingOrderId.current = null; if (currentOrderId.current === orderId) setRefreshing(false); }
  }, [params.orderId]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    void loadOrder();
    const refreshInterval = setInterval(() => {
      const displayedOrder = currentOrder.current;
      if (AppState.currentState !== 'active' || updatingOrder.current) return;
      if (displayedOrder && isOrderClosed(displayedOrder) && (displayedOrder.status !== OrderStatus.Completed || displayedOrder.review)) return;
      void loadOrder();
    }, 30_000);
    const appStateSubscription = AppState.addEventListener('change', state => { if (state === 'active') void loadOrder(); });
    return () => { focused.current = false; clearInterval(refreshInterval); appStateSubscription.remove(); };
  }, [loadOrder]));

  async function updateStatus(status: OrderStatus) {
    if (loading) return;
    setLoading(true);
    try {
      const updatedOrder = await apiRequest<Order>(`/marketplace/orders/${params.orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      mutationVersion.current += 1;
      setOrder(current => current ? { ...current, ...updatedOrder } : current);
      await loadOrder();
    } catch (failure) { Alert.alert('Andamento não atualizado', failure instanceof Error ? failure.message : 'Não foi possível registrar esta etapa do serviço.'); }
    finally { setLoading(false); }
  }

  function finishService() {
    Alert.alert('Confirmar conclusão?', 'Confirme que o atendimento foi realizado. A conclusão libera a avaliação e as fotos do resultado.', [{ text: 'Voltar', style: 'cancel' }, { text: 'Concluir serviço', onPress: () => void updateStatus(OrderStatus.Completed) }]);
  }

  function cancel() {
    Alert.alert('Cancelar pedido?', 'O cancelamento ficará registrado no histórico.', [{ text: 'Voltar', style: 'cancel' }, { text: 'Cancelar pedido', style: 'destructive', onPress: async () => {
      setLoading(true);
      try { const cancelledOrder = await apiRequest<Order>(`/marketplace/orders/${params.orderId}/cancel`, { method: 'POST', body: JSON.stringify({ reason: 'other', details: 'Cancelado pelo aplicativo mobile.' }) }); mutationVersion.current += 1; setOrder(current => current ? { ...current, ...cancelledOrder } : current); await loadOrder(); }
      catch (failure) { Alert.alert('Pedido não cancelado', failure instanceof Error ? failure.message : 'Não foi possível cancelar este atendimento.'); }
      finally { setLoading(false); }
    } }]);
  }

  function openConversation() {
    if (!conversation) { Alert.alert('Conversa indisponível', chatError || 'Não foi possível localizar a conversa deste atendimento. Atualize a página e tente novamente.'); return; }
    navigation.navigate('Chat', { conversationId: conversation.id, otherUserId: conversation.otherUser.id, otherUserName: conversation.otherUser.name, serviceName: conversation.service.name, isWritable: conversation.isWritable });
  }

  async function rehire() {
    if (loading) return;
    setLoading(true);
    try { await apiRequest(`/marketplace/orders/${params.orderId}/rehire`, { method: 'POST' }); Alert.alert('Solicitação criada', 'O profissional receberá um novo pedido direcionado.'); }
    catch (failure) { Alert.alert('Solicitação não criada', failure instanceof Error ? failure.message : 'Não foi possível solicitar uma nova contratação deste profissional.'); }
    finally { setLoading(false); }
  }

  if (!order || order.id !== params.orderId) return <Screen><StateView loading={!error} title={error ? 'Pedido indisponível' : undefined} message={error || 'Carregando seu atendimento...'} onAction={error ? () => void loadOrder() : undefined} /></Screen>;
  const isClient = order.clientId === user?.id;
  const isProfessional = order.professionalId === user?.id;
  const isFinished = isOrderClosed(order);
  const participant = isClient ? order.professional : order.client;

  return <Screen refreshing={refreshing} onRefresh={() => void loadOrder(true)}>
    {Boolean(error) && <StateView message={error} onAction={() => void loadOrder(true)} />}
    <OrderServiceSummary order={order} onViewDetails={() => setDetailsExpanded(true)} />
    <View style={[styles.statusNotice, order.status === OrderStatus.Disputed && styles.disputedNotice]}><Feather name="info" size={18} color={colors.primary} /><Text style={styles.statusDescription}>{resolveOrderStatusDescription(order.status, isClient, Boolean(order.scheduledAt))}</Text></View>
    <OrderParticipantSummary order={order} isClient={isClient} canChat={Boolean(conversation)} onChat={openConversation} onViewProfessional={() => navigation.navigate('Professional', { professionalId: order.professionalId })} />
    <OrderProgress order={order} review={order.review} />
    <View style={styles.priceCard}><View style={styles.priceLabel}><Feather name="tag" size={18} color={colors.primary} /><Text style={styles.line}>Valor combinado</Text></View><Text style={styles.price}>{formatCurrency(Number(order.agreedPrice))}</Text></View>
    <AppButton label={conversation?.isWritable ? `Conversar com ${participant.name.split(' ')[0]}` : 'Ver conversa do serviço'} icon={<Feather name="message-circle" size={18} color={colors.white} />} disabled={!conversation} onPress={openConversation} />
    {Boolean(chatError) && <Text style={styles.help}>{chatError}</Text>}
    <OrderAgreementDetails order={order} expanded={detailsExpanded} onToggle={() => setDetailsExpanded(current => !current)} />
    {dispute && <View style={styles.disputeCard}><Text style={styles.heading}>Detalhes da disputa</Text><Text style={styles.disputeLabel}>Motivo</Text><Text style={styles.line}>{resolveEnumLabel(dispute.reason)}</Text><Text style={styles.disputeLabel}>Relato enviado</Text><Text style={styles.line}>{dispute.description}</Text><Text style={styles.disputeLabel}>Andamento</Text><Text style={styles.line}>{resolveStatusLabel(dispute.status)}</Text>{Boolean(dispute.resolutionNotes) && <><Text style={styles.disputeLabel}>Resposta da moderação</Text><Text style={styles.line}>{dispute.resolutionNotes}</Text></>}<Text style={styles.help}>As atualizações desta disputa também aparecem em Notificações.</Text></View>}
    {Boolean(disputeError) && <StateView title="Detalhes da disputa indisponíveis" message={disputeError} onAction={() => void loadOrder(true)} />}
    {isProfessional && [OrderStatus.Accepted, OrderStatus.Scheduled].includes(order.status) && <AppButton label="Iniciar serviço" onPress={() => void updateStatus(OrderStatus.InProgress)} loading={loading} />}
    {(isClient || isProfessional) && order.status === OrderStatus.InProgress && <AppButton label={isClient ? 'Confirmar conclusão do serviço' : 'Marcar como concluído'} onPress={finishService} loading={loading} />}
    {isProfessional && order.status === OrderStatus.Completed && <CompletedOrderPhotos key={order.id} orderId={order.id} />}
    {order.status === OrderStatus.Completed && <OrderReviewPanel key={order.id} orderId={order.id} review={order.review} isClient={isClient} onPublished={review => { mutationVersion.current += 1; setOrder(current => current ? { ...current, review } : current); }} />}
    {isClient && order.status === OrderStatus.Completed && <AppButton label="Contratar novamente" variant="secondary" onPress={() => void rehire()} loading={loading} />}
    <View style={styles.helpCard}><Pressable accessibilityRole="button" accessibilityState={{ expanded: helpExpanded }} onPress={() => setHelpExpanded(current => !current)} style={styles.helpTrigger}><Feather name="help-circle" size={20} color={colors.primary} /><Text style={styles.helpTitle}>Ajuda com este serviço</Text><Feather name={helpExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} /></Pressable>
      {helpExpanded && <View style={styles.helpActions}><Text style={styles.help}>Use a conversa para combinar detalhes. Em caso de problema, registre uma disputa ou consulte o suporte.</Text><AppButton label="Falar com o suporte" variant="secondary" onPress={() => navigation.navigate('Contact')} />{![OrderStatus.CancelledByClient, OrderStatus.CancelledByProfessional, OrderStatus.Disputed].includes(order.status) && <AppButton label="Registrar problema com o serviço" variant="secondary" onPress={() => navigation.navigate('Dispute', { orderId: order.id })} />}{!isFinished && order.status !== OrderStatus.Disputed && <AppButton label="Cancelar pedido" variant="secondary" onPress={cancel} loading={loading} />}{order.status === OrderStatus.Disputed && <Text style={styles.help}>O cancelamento fica bloqueado enquanto a disputa está sendo analisada pela moderação.</Text>}</View>}
    </View>
  </Screen>;
}

const styles = StyleSheet.create({ statusNotice: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16, backgroundColor: colors.primarySoft }, disputedNotice: { borderWidth: 1, borderColor: colors.warning }, statusDescription: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 20 }, priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, priceLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 }, price: { color: colors.text, fontSize: 22, fontWeight: '800' }, line: { color: colors.textMuted, fontSize: 13, lineHeight: 20 }, disputeCard: { gap: 8, padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.warning }, disputeLabel: { marginTop: 4, color: colors.text, fontWeight: '800' }, heading: { color: colors.text, fontSize: 17, fontWeight: '800' }, helpCard: { padding: 16, borderRadius: 18, backgroundColor: colors.successSoft }, helpTrigger: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 10 }, helpTitle: { flex: 1, color: colors.primary, fontWeight: '800', fontSize: 14 }, helpActions: { gap: 12, paddingTop: 14 }, help: { color: colors.textMuted, fontSize: 12, lineHeight: 19 } });
