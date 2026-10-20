import { Feather } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '../components/ui/AppText';
import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { OpportunityMatch } from '../components/professional/OpportunityMatch';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips, ChoiceOption } from '../components/ui/ChoiceChips';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ServiceActivityCard } from '../components/ui/ServiceActivityCard';
import { ServiceActivitySummary } from '../components/ui/ServiceActivitySummary';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Order, Proposal, ServiceRequest } from '../types/api';
import { formatCurrency } from '../utils/currency';
import { formatAppointment } from '../utils/date';
import { groupOrdersByUserRole, summarizeOrders } from '../utils/orderDetails';
import { calculateProposalTotal, resolveProposalStatusLabel, resolveProposalValidity } from '../utils/proposal';

type RequestsSection = 'requests' | 'opportunities' | 'proposals' | 'orders' | 'jobs';

const sectionOptions: ChoiceOption<RequestsSection>[] = [
  { value: 'orders', label: 'Atendimentos' },
  { value: 'requests', label: 'Orçamentos pedidos' },
  { value: 'jobs', label: 'Atendimentos' },
  { value: 'proposals', label: 'Orçamentos' },
  { value: 'opportunities', label: 'Oportunidades' }
];
const roleOptions: ChoiceOption<'client' | 'professional'>[] = [
  { value: 'client', label: 'Contratei', icon: 'shopping-cart' },
  { value: 'professional', label: 'Meu trabalho', icon: 'briefcase' }
];
const sectionTitles: Record<RequestsSection, string> = {
  requests: 'Orçamentos que pedi', orders: 'Serviços para mim', jobs: 'Meus trabalhos', proposals: 'Orçamentos que enviei', opportunities: 'Trabalhos disponíveis para você'
};

export function RequestsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [section, setSection] = useState<RequestsSection>('orders');
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

  const { hiredOrders, acceptedJobs } = useMemo(() => groupOrdersByUserRole(orders, user?.id), [orders, user?.id]);
  const isProfessionalSection = section === 'jobs' || section === 'proposals' || section === 'opportunities';
  const visibleOrders = isProfessionalSection ? acceptedJobs : hiredOrders;
  const orderSummary = useMemo(() => summarizeOrders(visibleOrders), [visibleOrders]);
  const visibleSectionOptions = sectionOptions.filter(option => isProfessionalSection === (option.value === 'jobs' || option.value === 'proposals' || option.value === 'opportunities'));
  const sectionCount = { requests: requests.length, opportunities: opportunities.length, proposals: proposals.length, orders: hiredOrders.length, jobs: acceptedJobs.length }[section];

  return <Screen>
    <SectionHeader title="Meus serviços" />
    <ChoiceChips value={isProfessionalSection ? 'professional' : 'client'} onChange={role => setSection(role === 'professional' ? 'jobs' : 'orders')} options={roleOptions} segmented />
    <ChoiceChips value={section} onChange={setSection} options={visibleSectionOptions} />
    {!loading && !error && (section === 'orders' || section === 'jobs') && <ServiceActivitySummary {...orderSummary} />}
    {section === 'requests' && <AppButton label="Pedir um novo orçamento" icon={<Feather name="plus" size={19} color={colors.white} />} onPress={() => navigation.navigate('Services')} />}
    {loading && <StateView loading message="Carregando solicitações e pedidos..." />}
    {Boolean(error) && <StateView icon="alert-circle" title="Não foi possível atualizar" message={error} onAction={() => void loadRequests()} />}
    {!loading && !error && <>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{sectionTitles[section]}</Text><Text style={styles.count}>{sectionCount} {sectionCount === 1 ? 'serviço' : 'serviços'}</Text></View>

      {section === 'requests' && <>
        {!requests.length && <StateView icon="file-text" title="Nenhum pedido de orçamento" />}
        {requests.map(request => <ServiceActivityCard key={request.id} title={request.service?.name || 'Serviço'} status={request.status} description={request.description} location={`${request.city}, ${request.state}`} summary={`${request.proposalCount} ${request.proposalCount === 1 ? 'proposta recebida' : 'propostas recebidas'}`} actionLabel="Ver pedido de orçamento" onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })} />)}
      </>}

      {section === 'proposals' && <>
        {!proposals.length && <StateView icon="send" title="Nenhuma proposta enviada" />}
        {proposals.map(proposal => <ServiceActivityCard key={proposal.id} title={proposal.request?.service?.name || 'Proposta enviada'} status={proposal.status} statusLabel={resolveProposalStatusLabel(proposal.status)} description={proposal.request?.description || proposal.message} summary={formatCurrency(calculateProposalTotal(proposal))} actionLabel="Ver orçamento" onPress={() => navigation.navigate('RequestDetail', { requestId: proposal.requestId })}><Text style={styles.detail}>{resolveProposalValidity(proposal.validUntil, proposal.status)}</Text></ServiceActivityCard>)}
      </>}

      {section === 'opportunities' && <>
        {!opportunities.length && <StateView icon="search" title="Nenhuma oportunidade agora" />}
        {opportunities.map(opportunity => <ServiceActivityCard key={opportunity.id} title={opportunity.service?.name || 'Serviço'} status={opportunity.status} statusLabel={opportunity.preferredProfessionalId ? 'Solicitação direta para você' : 'Oportunidade'} description={opportunity.description} location={`${opportunity.city}, ${opportunity.state}`} summary={`${opportunity.proposalCount} de ${opportunity.maximumProposals} propostas`} actionLabel="Ver oportunidade" onPress={() => navigation.navigate('RequestDetail', { requestId: opportunity.id })}><OpportunityMatch score={opportunity.matchScore} reasons={opportunity.matchReasons} /></ServiceActivityCard>)}
      </>}

      {(section === 'orders' || section === 'jobs') && <>
        {!visibleOrders.length && <StateView icon="briefcase" title={section === 'jobs' ? 'Você ainda não tem trabalhos' : 'Você ainda não contratou um serviço'} />}
        {visibleOrders.map(order => <ServiceActivityCard key={order.id} title={order.request.service?.name || 'Serviço'} status={order.status} location={`${order.request.city}, ${order.request.state}`} appointment={formatAppointment(order.scheduledAt)} summaryLabel="Valor do serviço" summary={formatCurrency(Number(order.agreedPrice))} actionLabel="Ver atendimento" onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })} />)}
      </>}
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { flex: 1, color: colors.text, fontSize: 23, fontWeight: '800' },
  count: { color: colors.textMuted, fontSize: 13 },
  detail: { color: colors.textMuted, fontSize: 12, lineHeight: 18 }
});
