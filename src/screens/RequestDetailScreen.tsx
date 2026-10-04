import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { PrivateMediaImage } from '../components/ui/PrivateMediaImage';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { UserAvatar } from '../components/ui/UserAvatar';
import { ProfessionalReputation } from '../components/professional/ProfessionalReputation';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Conversation, Order, Proposal, ServiceRequest } from '../types/api';
import { formatCurrency } from '../utils/currency';
import { calculateProposalTotal, ProposalSort, resolveProposalStatusLabel, resolveProposalValidity, sortProposals } from '../utils/proposal';
import { resolveEnumLabel, resolveStatusLabel } from '../utils/status';

export function RequestDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'RequestDetail'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [proposalSort, setProposalSort] = useState(ProposalSort.LowestPrice);
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
  const sortedProposals = sortProposals(proposals, proposalSort);

  return <Screen>
    <SectionHeader eyebrow={resolveStatusLabel(request.status)} title={request.service?.name || 'Solicitação'} description={request.description} />
    <View style={styles.card}>
      <Text style={styles.line}>Local: {request.address}, {request.city}/{request.state}</Text>
      <Text style={styles.line}>Urgência: {resolveEnumLabel(request.urgency || 'flexible')}</Text>
      <Text style={styles.line}>Propostas: {request.proposalCount} de {request.maximumProposals}</Text>
      {Boolean(request.preferredAt) && <Text style={styles.line}>Preferência: {new Date(request.preferredAt || '').toLocaleString('pt-BR')}</Text>}
    </View>
    {Boolean(request.attachments?.length) && <View style={styles.attachmentsSection}><Text style={styles.heading}>Fotos anexadas pelo cliente</Text><View style={styles.attachments}>{request.attachments?.map(attachment => <PrivateMediaImage key={attachment.mediaId} mediaId={attachment.mediaId} accessibilityLabel={`Anexo ${attachment.fileName}`} compact />)}</View></View>}
    {conversation && <AppButton label={conversation.isWritable ? 'Abrir chat' : 'Ver histórico da conversa'} onPress={openConversation} />}
    {!isOwner && !request.hasSubmittedProposal && <AppButton label="Enviar proposta" onPress={() => navigation.navigate('ProposalForm', { requestId: request.id, serviceName: request.service?.name || 'Serviço' })} />}
    {isOwner && <>
      <Text style={styles.heading}>Propostas recebidas</Text>
      {proposals.length > 1 && <ChoiceChips value={proposalSort} onChange={setProposalSort} options={[
        { value: ProposalSort.LowestPrice, label: 'Menor preço' },
        { value: ProposalSort.BestRated, label: 'Melhor avaliação' },
        { value: ProposalSort.FastestResponse, label: 'Resposta mais rápida' }
      ]} />}
      {!proposals.length && <StateView message="Nenhuma proposta recebida ainda." />}
      {sortedProposals.map(proposal => <View key={proposal.id} style={styles.card}>
        <View style={styles.comparisonHeader}><Text style={styles.status}>{resolveProposalStatusLabel(proposal.status)}</Text><Text style={styles.validity}>{resolveProposalValidity(proposal.validUntil, proposal.status)}</Text></View>
        <View style={styles.professional}><UserAvatar name={proposal.professional?.name || 'Profissional'} mediaId={proposal.professional?.profilePhotoMediaId} /><View style={styles.grow}><Text style={styles.name}>{proposal.professional?.name}</Text>{proposal.professional && <ProfessionalReputation professional={proposal.professional} compact />}<Text style={styles.price}>{formatCurrency(calculateProposalTotal(proposal))}</Text></View></View>
        <Text style={styles.line}>{proposal.message}</Text>
        <View style={styles.costs}><Text style={styles.line}>Serviço: {formatCurrency(Number(proposal.price))}</Text><Text style={styles.line}>Deslocamento: {formatCurrency(Number(proposal.travelFee))}</Text></View>
        <Text style={styles.line}>{proposal.estimatedDurationMinutes} min · Materiais {proposal.materialsIncluded ? 'incluídos' : 'não incluídos'}</Text>
        <Text style={styles.line}>Pagamento: {proposal.paymentMethods.map(resolveEnumLabel).join(', ')}</Text>
        {proposal.professional?.metrics?.averageResponseMinutes && <Text style={styles.line}>Responde em cerca de {proposal.professional.metrics.averageResponseMinutes} min</Text>}
        {proposal.professional?.id && <AppButton label="Ver perfil e avaliações" variant="secondary" onPress={() => navigation.navigate('Professional', { professionalId: proposal.professional!.id })} />}
        {proposal.status === 'sent' && request.status !== 'accepted' && <AppButton label="Aceitar proposta" onPress={() => accept(proposal.id)} />}
      </View>)}
    </>}
  </Screen>;
}

const styles = StyleSheet.create({ card: { gap: 10, padding: 17, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, line: { color: colors.textMuted, lineHeight: 20 }, heading: { color: colors.text, fontSize: 20, fontWeight: '900' }, attachmentsSection: { gap: 10 }, attachments: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, professional: { flexDirection: 'row', alignItems: 'center', gap: 12 }, grow: { flex: 1, gap: 3 }, name: { color: colors.text, fontWeight: '800' }, price: { color: colors.primary, fontSize: 20, fontWeight: '900' }, comparisonHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, status: { color: colors.accent, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }, validity: { color: colors.textMuted, fontSize: 12, fontWeight: '700' }, costs: { padding: 12, gap: 4, borderRadius: 12, backgroundColor: colors.background } });
