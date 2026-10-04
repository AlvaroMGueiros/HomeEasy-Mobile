import { Feather } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { OpportunityMatch } from '../components/professional/OpportunityMatch';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips, ChoiceOption } from '../components/ui/ChoiceChips';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ServiceActivityCard } from '../components/ui/ServiceActivityCard';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Order, Proposal, ServiceRequest } from '../types/api';
import { formatCurrency } from '../utils/currency';
import { formatAppointment } from '../utils/date';
import { calculateProposalTotal, resolveProposalStatusLabel, resolveProposalValidity } from '../utils/proposal';

type RequestsSection = 'requests' | 'opportunities' | 'proposals' | 'orders';

const sectionOptions: ChoiceOption<RequestsSection>[] = [
  { value: 'requests', label: 'Solicitações' },
  { value: 'orders', label: 'Pedidos' },
  { value: 'proposals', label: 'Propostas' },
  { value: 'opportunities', label: 'Oportunidades' }
];
const sectionTitles: Record<RequestsSection, string> = {
  requests: 'Minhas solicitações', orders: 'Serviços contratados', proposals: 'Propostas enviadas', opportunities: 'Oportunidades para você'
};

export function RequestsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [section, setSection] = useState<RequestsSection>('requests');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [opportunities, setOpportunities] = useState<ServiceRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = useCallback(() => {
    setLoading(true);
    setError('');
    return Promise.all([
      apiRequest<ServiceRequest[]>('/marketplace/requests/me'),
      apiRequest<ServiceRequest[]>('/marketplace/opportunities').catch(() => []),
      apiRequest<Proposal[]>('/marketplace/proposals/me').catch(() => []),
      apiRequest<Order[]>('/marketplace/orders/me')
    ])
      .then(([requestList, opportunityList, proposalList, orderList]) => {
        setRequests(requestList);
        setOpportunities(opportunityList);
        setProposals(proposalList);
        setOrders(orderList);
      })
      .catch(currentError => setError(currentError instanceof Error ? currentError.message : 'Não foi possível carregar suas solicitações e pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { void loadRequests(); }, [loadRequests]));

  const sectionCount = { requests: requests.length, opportunities: opportunities.length, proposals: proposals.length, orders: orders.length }[section];

  return <Screen>
    <SectionHeader eyebrow="Acompanhamento" title="Meus serviços" description="Organize suas solicitações e acompanhe cada atendimento." />
    <ChoiceChips value={section} onChange={setSection} options={sectionOptions} scrollable />
    {section === 'requests' && <AppButton label="Nova solicitação" icon={<Feather name="plus" size={19} color={colors.white} />} onPress={() => navigation.navigate('Services')} />}
    {loading && <StateView loading message="Carregando solicitações e pedidos..." />}
    {Boolean(error) && <StateView icon="alert-circle" title="Não foi possível atualizar" message={error} onAction={() => void loadRequests()} />}
    {!loading && !error && <>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{sectionTitles[section]}</Text><View style={styles.countBadge}><Text style={styles.count}>{sectionCount}</Text></View></View>

      {section === 'requests' && <>
        {!requests.length && <StateView icon="file-text" title="Sua primeira solicitação" message="Escolha um serviço e conte o que você precisa para receber propostas." />}
        {requests.map(request => <ServiceActivityCard key={request.id} title={request.service?.name || 'Serviço'} status={request.status} description={request.description} location={`${request.city}, ${request.state}`} summary={`${request.proposalCount} ${request.proposalCount === 1 ? 'proposta recebida' : 'propostas recebidas'}`} actionLabel="Ver solicitação" onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })} />)}
      </>}

      {section === 'proposals' && <>
        {!proposals.length && <StateView icon="send" title="Nenhuma proposta enviada" message="Consulte as oportunidades para encontrar solicitações compatíveis com seus serviços." />}
        {proposals.map(proposal => <ServiceActivityCard key={proposal.id} title={proposal.request?.service?.name || 'Proposta enviada'} status={proposal.status} statusLabel={resolveProposalStatusLabel(proposal.status)} description={proposal.request?.description || proposal.message} summary={formatCurrency(calculateProposalTotal(proposal))} actionLabel="Ver proposta" onPress={() => navigation.navigate('RequestDetail', { requestId: proposal.requestId })}><Text style={styles.detail}>{resolveProposalValidity(proposal.validUntil, proposal.status)}</Text></ServiceActivityCard>)}
      </>}

      {section === 'opportunities' && <>
        {!opportunities.length && <StateView icon="search" title="Nenhuma oportunidade agora" message="Novas solicitações aparecerão aqui quando estiverem disponíveis." />}
        {opportunities.map(opportunity => <ServiceActivityCard key={opportunity.id} title={opportunity.service?.name || 'Serviço'} status={opportunity.status} statusLabel={opportunity.preferredProfessionalId ? 'Solicitação direta para você' : 'Oportunidade'} description={opportunity.description} location={`${opportunity.city}, ${opportunity.state}`} summary={`${opportunity.proposalCount} de ${opportunity.maximumProposals} propostas`} actionLabel="Ver oportunidade" onPress={() => navigation.navigate('RequestDetail', { requestId: opportunity.id })}><OpportunityMatch score={opportunity.matchScore} reasons={opportunity.matchReasons} /></ServiceActivityCard>)}
      </>}

      {section === 'orders' && <>
        {!orders.length && <StateView icon="briefcase" title="Nenhum serviço contratado" message="Os pedidos aparecem aqui após a aceitação de uma proposta." />}
        {orders.map(order => <ServiceActivityCard key={order.id} title={order.request.service?.name || 'Serviço contratado'} status={order.status} location={`${order.request.city}, ${order.request.state}`} summary={formatCurrency(Number(order.agreedPrice))} actionLabel="Ver atendimento" onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}><Text style={styles.detail}>{formatAppointment(order.scheduledAt)}</Text></ServiceActivityCard>)}
      </>}
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '800' },
  countBadge: { minWidth: 28, minHeight: 28, paddingHorizontal: 8, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  count: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  detail: { color: colors.textMuted, fontSize: 12, lineHeight: 18 }
});
