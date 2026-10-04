import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Order, Proposal } from '../types/api';
import { formatCurrency } from '../utils/currency';
import { formatAppointment } from '../utils/date';
import { calculateProfessionalDashboard, findUpcomingOrders } from '../utils/professional-dashboard';
import { resolveStatusLabel } from '../utils/status';

export function ProfessionalDashboardScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      apiRequest<Proposal[]>('/marketplace/proposals/me').catch(() => []),
      apiRequest<Order[]>('/marketplace/orders/me')
    ])
      .then(([proposalList, orderList]) => { setProposals(proposalList); setOrders(orderList); })
      .catch(() => setError('Não foi possível carregar seu painel profissional.'))
      .finally(() => setLoading(false));
  }, []));

  const metrics = calculateProfessionalDashboard(proposals, orders);
  const upcomingOrders = findUpcomingOrders(orders);
  const nextOrder = upcomingOrders[0];

  return <Screen>
    <SectionHeader eyebrow="Área profissional" title="Seu trabalho, organizado" description="Seu próximo atendimento, oportunidades e resultados em um só lugar." />
    {loading && <StateView loading message="Calculando seus resultados..." />}
    {Boolean(error) && <StateView message={error} />}
    {!loading && !error && <>
      <Text style={styles.heading}>Próximo atendimento</Text>
      {nextOrder ? <View style={styles.order}><Text style={styles.orderStatus}>{resolveStatusLabel(nextOrder.status)}</Text><Text style={styles.orderTitle}>{nextOrder.request.service?.name || 'Serviço'}</Text><Text style={styles.orderMeta}>{formatAppointment(nextOrder.scheduledAt)}</Text><Text style={styles.orderMeta}>{nextOrder.request.city}, {nextOrder.request.state}</Text><AppButton label="Ver atendimento" onPress={() => navigation.navigate('OrderDetail', { orderId: nextOrder.id })} /></View> : <StateView message="Nenhum próximo atendimento agendado. Consulte oportunidades ou configure sua disponibilidade." />}
      <View style={styles.actions}><AppButton label="Ver oportunidades" onPress={() => navigation.navigate('Opportunities')} /><AppButton label="Configurar agenda" variant="secondary" onPress={() => navigation.navigate('Schedule')} /></View>
      <Text style={styles.heading}>Seu desempenho</Text>
      <View style={styles.metrics}><Metric label="Propostas" value={metrics.proposalsSent} /><Metric label="Aceitas" value={metrics.proposalsAccepted} /><Metric label="Conversão" value={`${metrics.conversionRate}%`} /><Metric label="Em andamento" value={metrics.activeOrders} /><Metric label="Concluídos" value={metrics.completedOrders} /><Metric label="Receita concluída" value={formatCurrency(metrics.grossRevenue)} /></View>
      {upcomingOrders.length > 1 && <Text style={styles.heading}>Outros serviços agendados</Text>}
      {upcomingOrders.slice(1).map(order => <Pressable accessibilityRole="button" key={order.id} style={styles.order} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}><Text style={styles.orderTitle}>{order.request.service?.name || 'Serviço'}</Text><Text style={styles.orderMeta}>{formatAppointment(order.scheduledAt)}</Text><Text style={styles.orderStatus}>{resolveStatusLabel(order.status)}</Text></Pressable>)}
    </>}
  </Screen>;
}

function Metric({ label, value }: { label: string; value: string | number }) { return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({ metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, metric: { width: '48%', minHeight: 94, justifyContent: 'center', padding: 15, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, metricValue: { color: colors.primary, fontSize: 22, fontWeight: '900' }, metricLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' }, actions: { gap: 10 }, heading: { color: colors.text, fontSize: 20, fontWeight: '900' }, order: { gap: 5, padding: 16, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, orderTitle: { color: colors.text, fontSize: 17, fontWeight: '900' }, orderMeta: { color: colors.textMuted }, orderStatus: { color: colors.accent, fontSize: 12, fontWeight: '800' } });
