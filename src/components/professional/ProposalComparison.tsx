import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Proposal } from '../../types/api';
import { formatCurrency } from '../../utils/currency';
import { formatOrderPaymentMethods, formatServiceDuration } from '../../utils/orderDetails';
import { calculateProposalTotal, resolveProposalValidity } from '../../utils/proposal';
import { AppText } from '../ui/AppText';
import { AppButton } from '../ui/AppButton';
import { ProfessionalReputation } from './ProfessionalReputation';

export function ProposalComparison({ proposals, canAccept, onAccept }: { proposals: Proposal[]; canAccept: boolean; onAccept(proposalId: string): void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.columns}>
    {proposals.map(proposal => <View key={proposal.id} style={styles.column}>
      <AppText style={styles.name} numberOfLines={2}>{proposal.professional?.name || 'Profissional'}</AppText>
      <View style={styles.cell}><AppText style={styles.label}>Total com deslocamento</AppText><AppText style={styles.price}>{formatCurrency(calculateProposalTotal(proposal))}</AppText></View>
      <View style={styles.cell}><AppText style={styles.label}>Duração estimada</AppText><AppText>{formatServiceDuration(proposal.estimatedDurationMinutes)}</AppText></View>
      <View style={styles.cell}><AppText style={styles.label}>Materiais</AppText><AppText>{proposal.materialsIncluded ? 'Incluídos' : 'Não incluídos'}</AppText></View>
      <View style={styles.cell}><AppText style={styles.label}>Pagamento</AppText><AppText numberOfLines={3}>{formatOrderPaymentMethods(proposal.paymentMethods)}</AppText></View>
      <View style={styles.cell}><AppText style={styles.label}>Avaliações</AppText>{proposal.professional && <ProfessionalReputation professional={proposal.professional} compact />}</View>
      <View style={styles.scope}><AppText style={styles.label}>O que está incluído</AppText><AppText>{proposal.message}</AppText></View>
      <AppText style={styles.label}>{resolveProposalValidity(proposal.validUntil, proposal.status)}</AppText>
      {canAccept && proposal.status === 'sent' && Date.parse(proposal.validUntil) > Date.now() && <AppButton label="Escolher proposta" onPress={() => onAccept(proposal.id)} />}
    </View>)}
  </ScrollView>;
}

const styles = StyleSheet.create({ columns: { gap: 12, paddingBottom: 12 }, column: { width: 272, padding: 16, gap: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, name: { color: colors.text, fontSize: 18, fontWeight: '800', height: 52 }, cell: { height: 100, gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }, scope: { gap: 8, minHeight: 120 }, label: { color: colors.textMuted, fontSize: 12 }, price: { color: colors.primary, fontSize: 23, fontWeight: '800' } });
