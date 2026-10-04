import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { OrderDetail } from '../../types/api';
import { UserAvatar } from '../ui/UserAvatar';
import { ProfessionalReputation } from './ProfessionalReputation';

export function OrderParticipantSummary({ order, isClient, canChat, onChat, onViewProfessional }: { order: OrderDetail; isClient: boolean; canChat: boolean; onChat(): void; onViewProfessional(): void }) {
  const participant = isClient ? order.professional : order.client;
  return <View style={styles.container}>
    <View style={styles.identity}><Pressable disabled={!isClient} accessibilityRole={isClient ? 'button' : undefined} accessibilityLabel={isClient ? 'Ver perfil do profissional responsável' : undefined} onPress={onViewProfessional} style={styles.participant}><UserAvatar name={participant.name} mediaId={participant.profilePhotoMediaId} size={52} /><View style={styles.copy}><Text style={styles.name}>{participant.name}</Text><Text style={styles.role}>{isClient ? 'Profissional responsável' : 'Cliente do serviço'}</Text></View></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Abrir conversa do serviço" disabled={!canChat} onPress={onChat} style={styles.chat}><Feather name="message-circle" size={21} color={colors.primary} /></Pressable></View>
    {isClient && <ProfessionalReputation professional={order.professional} compact />}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, identity: { flexDirection: 'row', alignItems: 'center', gap: 10 }, participant: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 52 }, copy: { flex: 1, gap: 4 }, name: { color: colors.text, fontSize: 16, fontWeight: '800' }, role: { color: colors.textMuted, fontSize: 12 }, chat: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center' } });
