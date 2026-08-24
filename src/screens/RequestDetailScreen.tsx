import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { UserAvatar } from '../components/ui/UserAvatar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Conversation, Order, Proposal, ServiceRequest } from '../types/api';
import { formatCurrency } from '../utils/currency';
import { resolveEnumLabel, resolveStatusLabel } from '../utils/status';

export function RequestDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'RequestDetail'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [params.requestId]);

  async function load() {
    try {
      const currentRequest = await apiRequest<ServiceRequest>(`/marketplace/requests/${params.requestId}`);
      setRequest(currentRequest);
      if (currentRequest.clientId === user?.id) {
        const [currentProposals, orders, conversations] = await Promise.all([
          apiRequest<Proposal[]>(`/marketplace/requests/${params.requestId}/proposals`),
          apiRequest<Order[]>('/marketplace/orders/me'),
          apiRequest<Conversation[]>('/conversations')
        ]);
        setProposals(currentProposals);
        const acceptedOrder = orders.find(order => order.requestId === currentRequest.id);
        setConversation(acceptedOrder
          ? conversations.find(currentConversation => currentConversation.orderId === acceptedOrder.id) || null
          : null);
      }
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Não foi possível carregar a solicitação.');
    }
  }

  function accept(proposalId: string) {
    Alert.alert('Aceitar proposta?', 'Essa ação cria o pedido e libera uma conversa exclusiva para este serviço.', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Aceitar', onPress: async () => {
        try {
          await apiRequest(`/marketplace/requests/${params.requestId}/proposals/${proposalId}/accept`, { method: 'POST' });
          Alert.alert('Proposta aceita', 'O pedido e sua conversa foram criados.', [{ text: 'Ver pedidos', onPress: () => navigation.navigate('App', { screen: 'Requests' }) }]);
        } catch (currentError) {
          Alert.alert('Não foi possível aceitar', currentError instanceof Error ? currentError.message : 'Tente novamente.');
        }
      } }
    ]);
  }

  function openConversation() {
    if (!conversation) return;
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      otherUserId: conversation.otherUser.id,
      otherUserName: conversation.otherUser.name,
      serviceName: conversation.service.name,
      isWritable: conversation.isWritable
    });
  }

  if (!request) return <Screen><StateView loading={!error} message={error || 'Carregando solicitação...'} /></Screen>;
  const isOwner = request.clientId === user?.id;

  return <Screen>
    <SectionHeader eyebrow={resolveStatusLabel(request.status)} title={request.service?.name || 'Solicitação'} description={request.description} />
    <View style={styles.card}>
      <Text style={styles.line}>Local: {request.address}, {request.city}/{request.state}</Text>
      <Text style={styles.line}>Urgência: {resolveEnumLabel(request.urgency || 'flexible')}</Text>
      <Text style={styles.line}>Propostas: {request.proposalCount} de {request.maximumProposals}</Text>
      {Boolean(request.preferredAt) && <Text style={styles.line}>Preferência: {new Date(request.preferredAt || '').toLocaleString('pt-BR')}</Text>}
    </View>
    {conversation && <AppButton label={conversation.isWritable ? 'Abrir chat' : 'Ver histórico da conversa'} onPress={openConversation} />}
    {!isOwner && !request.hasSubmittedProposal && <AppButton label="Enviar proposta" onPress={() => navigation.navigate('ProposalForm', { requestId: request.id, serviceName: request.service?.name || 'Serviço' })} />}
    {isOwner && <>
      <Text style={styles.heading}>Propostas recebidas</Text>
      {!proposals.length && <StateView message="Nenhuma proposta recebida ainda." />}
      {proposals.map(proposal => <View key={proposal.id} style={styles.card}>
        <View style={styles.professional}><UserAvatar name={proposal.professional?.name || 'Profissional'} mediaId={proposal.professional?.profilePhotoMediaId} /><View style={styles.grow}><Text style={styles.name}>{proposal.professional?.name}</Text><Text style={styles.price}>{formatCurrency(Number(proposal.price) + Number(proposal.travelFee))}</Text></View></View>
        <Text style={styles.line}>{proposal.message}</Text>
        <Text style={styles.line}>{proposal.estimatedDurationMinutes} min · Materiais {proposal.materialsIncluded ? 'incluídos' : 'não incluídos'}</Text>
        {proposal.status === 'sent' && request.status !== 'accepted' && <AppButton label="Aceitar proposta" onPress={() => accept(proposal.id)} />}
      </View>)}
    </>}
  </Screen>;
}

const styles = StyleSheet.create({ card: { gap: 10, padding: 17, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, line: { color: colors.textMuted, lineHeight: 20 }, heading: { color: colors.text, fontSize: 20, fontWeight: '900' }, professional: { flexDirection: 'row', alignItems: 'center', gap: 12 }, grow: { flex: 1 }, name: { color: colors.text, fontWeight: '800' }, price: { color: colors.primary, fontWeight: '900' } });
