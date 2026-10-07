import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { OrderDetail } from '../../types/api';
import { formatAppointmentDay, formatAppointmentTimeRange } from '../../utils/date';
import { formatServiceAddress } from '../../utils/service-address';
import { resolveServiceIcon } from '../../utils/service-icon';
import { PrivateMediaImage } from '../ui/PrivateMediaImage';
import { StatusBadge } from '../ui/StatusBadge';

export function OrderServiceSummary({ order, onViewDetails, onViewAddress }: { order: OrderDetail; onViewDetails(): void; onViewAddress(): void }) {
  const attachment = order.request.attachments?.find(photo => photo.contentType.startsWith('image/'));
  const serviceName = order.request.service?.name || 'Meu serviço';
  return <View style={styles.container}>
    <View style={styles.heading}><Text style={styles.title}>{serviceName}</Text><StatusBadge status={order.status} /></View>
    {attachment ? <PrivateMediaImage mediaId={attachment.mediaId} accessibilityLabel={`Foto da solicitação de ${serviceName}`} wide /> : <View style={styles.serviceIllustration}><View style={styles.serviceIcon}><Feather name={resolveServiceIcon(serviceName)} size={30} color={colors.primary} /></View><View style={styles.serviceCopy}><Text style={styles.serviceLabel}>Seu atendimento</Text><Text numberOfLines={2} style={styles.description}>{order.request.description}</Text></View></View>}
    <View style={styles.appointment}>
      <View style={styles.calendar}><Feather name="calendar" size={20} color={colors.primary} /></View>
      <View style={styles.appointmentCopy}><Pressable accessibilityRole="button" accessibilityLabel="Ver horário do atendimento" onPress={onViewDetails}><Text style={styles.day}>{formatAppointmentDay(order.scheduledAt)}</Text><Text style={styles.hours}>{formatAppointmentTimeRange(order.scheduledAt, order.proposal.estimatedDurationMinutes)}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Ver endereço do serviço no mapa" onPress={onViewAddress} style={[styles.location, { minHeight: 44 }]}><Feather name="map-pin" size={16} color={colors.primary} /><Text numberOfLines={2} style={styles.locationLabel}>{formatServiceAddress(order.request)}</Text><Feather name="chevron-right" size={18} color={colors.primary} /></Pressable></View>
    </View>
    {order.scheduledAt && <Text style={styles.help}>Término estimado conforme a duração informada na proposta.</Text>}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: 12 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, title: { flex: 1, color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '800' }, serviceIllustration: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 20, borderRadius: 18, backgroundColor: colors.primarySoft }, serviceIcon: { width: 58, height: 58, backgroundColor: colors.surface, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }, serviceCopy: { flex: 1, gap: 5 }, serviceLabel: { color: colors.primary, fontSize: 13, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 20 }, appointment: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, calendar: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }, appointmentCopy: { flex: 1, gap: 4 }, day: { color: colors.textMuted, fontSize: 12 }, hours: { color: colors.text, fontSize: 16, fontWeight: '800' }, location: { flexDirection: 'row', gap: 4, alignItems: 'center' }, locationLabel: { flex: 1, color: colors.textMuted, fontSize: 12 }, help: { color: colors.textMuted, fontSize: 11, lineHeight: 16 } });
