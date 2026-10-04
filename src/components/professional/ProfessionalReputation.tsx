import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Professional, ProfessionalVerificationStatus } from '../../types/api';

interface ProfessionalReputationProps {
  professional: Professional;
  compact?: boolean;
}

const verifiedStatuses = new Set([
  ProfessionalVerificationStatus.IdentityVerified,
  ProfessionalVerificationStatus.ProfessionalVerified,
  ProfessionalVerificationStatus.Featured,
  ProfessionalVerificationStatus.Verified
]);

export function ProfessionalReputation({ professional, compact = false }: ProfessionalReputationProps) {
  const metrics = professional.metrics;
  const isVerified = Boolean(
    professional.verificationStatus && verifiedStatuses.has(professional.verificationStatus)
  );
  const isProfessionallyVerified = professional.verificationStatus === ProfessionalVerificationStatus.ProfessionalVerified ||
    professional.verificationStatus === ProfessionalVerificationStatus.Verified ||
    professional.verificationStatus === ProfessionalVerificationStatus.Featured;

  return <View style={styles.container}>
    <View style={styles.badges}>
      {isVerified && <View style={styles.badge}><Feather name="check-circle" size={14} color={colors.success} /><Text style={styles.badgeText}>Identidade verificada</Text></View>}
      {isProfessionallyVerified && <View style={styles.badge}><Feather name="shield" size={14} color={colors.primary} /><Text style={styles.badgeText}>Profissional verificado</Text></View>}
      {professional.verificationStatus === ProfessionalVerificationStatus.Featured && <View style={styles.badge}><Feather name="award" size={14} color={colors.warning} /><Text style={styles.badgeText}>Destaque</Text></View>}
    </View>
    <View style={styles.metrics}>
      <Text style={styles.rating}>{metrics?.averageRating ? `★ ${metrics.averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · ${metrics.verifiedReviewCount || 0} ${(metrics.verifiedReviewCount || 0) === 1 ? 'avaliação' : 'avaliações'}` : 'Novo profissional · sem avaliações'}</Text>
      {!compact && <>
        <Text style={styles.metric}>{metrics?.completedServices || 0} serviços concluídos</Text>
        {metrics?.averageResponseMinutes !== null && metrics?.averageResponseMinutes !== undefined && <Text style={styles.metric}>Resposta média: {metrics.averageResponseMinutes} min</Text>}
        {metrics?.responseRate !== null && metrics?.responseRate !== undefined && <Text style={styles.metric}>{metrics.responseRate}% de respostas</Text>}
        {metrics?.cancellationRate !== null && metrics?.cancellationRate !== undefined && <Text style={styles.metric}>{metrics.cancellationRate}% de cancelamentos</Text>}
      </>}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  badgeText: { color: colors.text, fontSize: 11, fontWeight: '800' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rating: { color: colors.warning, fontSize: 12, fontWeight: '800' },
  metric: { color: colors.textMuted, fontSize: 12, fontWeight: '700' }
});
