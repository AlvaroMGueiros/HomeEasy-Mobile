import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Order } from '../../types/api';
import { formatCurrency } from '../../utils/currency';
import { formatOrderPaymentMethods, formatServiceDuration, resolveOrderAnswerDetails } from '../../utils/orderDetails';
import { resolveEnumLabel } from '../../utils/status';
import { PrivateMediaImage } from '../ui/PrivateMediaImage';

export function OrderAgreementDetails({ order, expanded, onToggle }: { order: Order; expanded: boolean; onToggle(): void }) {
  return <View style={styles.card}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={onToggle} style={styles.trigger}><Text style={styles.title}>{expanded ? 'Detalhes do atendimento' : 'Ver detalhes do atendimento'}</Text><Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} /></Pressable>
    {expanded && <View style={styles.details}>
      <Text style={styles.label}>O que foi solicitado</Text><Text style={styles.description}>{order.request.description}</Text>
      <Text style={styles.label}>Local do serviço</Text><Text style={styles.description}>{[order.request.address, order.request.city, order.request.state].filter(Boolean).join(', ') || 'Local a combinar'}</Text>
      <Text style={styles.label}>Proposta aceita</Text><Text style={styles.description}>{order.proposal.message}</Text>
      <View style={styles.fact}><Text style={styles.description}>Duração estimada</Text><Text style={styles.value}>{formatServiceDuration(order.proposal.estimatedDurationMinutes)}</Text></View>
      <View style={styles.fact}><Text style={styles.description}>Materiais</Text><Text style={styles.value}>{order.proposal.materialsIncluded ? 'Incluídos' : 'Não incluídos'}</Text></View>
      <View style={styles.fact}><Text style={styles.description}>Valor do serviço</Text><Text style={styles.value}>{formatCurrency(Number(order.proposal.price))}</Text></View>
      <View style={styles.fact}><Text style={styles.description}>Deslocamento</Text><Text style={styles.value}>{Number(order.proposal.travelFee) ? formatCurrency(Number(order.proposal.travelFee)) : 'Sem taxa'}</Text></View>
      <View style={styles.fact}><Text style={styles.description}>Valor combinado</Text><Text style={styles.value}>{formatCurrency(Number(order.agreedPrice))}</Text></View>
      <Text style={styles.label}>Formas de pagamento combinadas</Text><Text style={styles.description}>{formatOrderPaymentMethods(order.proposal.paymentMethods)}</Text>
      {resolveOrderAnswerDetails(order).map(answer => <View key={answer.key} style={styles.fact}><Text style={styles.description}>{answer.label}</Text><Text style={styles.value}>{answer.value}</Text></View>)}
      {Boolean(order.cancellationReason) && <><Text style={styles.label}>Motivo do cancelamento</Text><Text style={styles.description}>{resolveEnumLabel(order.cancellationReason || '')}</Text>{Boolean(order.cancellationDetails) && <Text style={styles.description}>{order.cancellationDetails}</Text>}</>}
      {Boolean(order.request.attachments?.length) && <><Text style={styles.label}>Fotos da solicitação</Text><View style={styles.attachments}>{order.request.attachments?.filter(attachment => attachment.contentType.startsWith('image/')).map(attachment => <PrivateMediaImage key={attachment.mediaId} mediaId={attachment.mediaId} accessibilityLabel={`Anexo ${attachment.fileName}`} compact />)}</View></>}
    </View>}
  </View>;
}

const styles = StyleSheet.create({ card: { padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, trigger: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { flex: 1, color: colors.primary, fontWeight: '800', fontSize: 14 }, details: { paddingTop: 16, gap: 12 }, label: { color: colors.text, fontWeight: '800', fontSize: 13 }, description: { flexShrink: 1, color: colors.textMuted, lineHeight: 20, fontSize: 13 }, fact: { flexDirection: 'row', justifyContent: 'space-between', gap: 14 }, value: { flexShrink: 1, color: colors.text, fontWeight: '700', fontSize: 13, textAlign: 'right' }, attachments: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } });
