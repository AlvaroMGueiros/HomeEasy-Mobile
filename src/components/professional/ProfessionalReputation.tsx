import { AppIcon } from '../ui/AppIcon';
import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '../ui/AppText';
import { colors } from '../../theme/colors';
import { Professional, ProfessionalVerificationStatus } from '../../types/api';
import { resolveProfessionalVerification } from '../../utils/professionalVerification';

interface ProfessionalReputationProps {
  professional: Professional;
  compact?: boolean;
}

export function ProfessionalReputation({ professional, compact = false }: ProfessionalReputationProps) {
  const metrics = professional.metrics;
  const checks = resolveProfessionalVerification(professional);

  return <View style={styles.container}>
    <View style={styles.badges}>
      {checks.identity && <View style={styles.badge}><AppIcon name="check-circle" size={14} color={colors.success} /><Text style={styles.badgeText}>Identidade verificada</Text></View>}
      {checks.certificate && <View style={styles.badge}><AppIcon name="shield" size={14} color={colors.primary} /><Text style={styles.badgeText}>Certificado verificado</Text></View>}
      {professional.verificationStatus === ProfessionalVerificationStatus.Featured && <View style={styles.badge}><AppIcon name="award" size={14} color={colors.warning} /><Text style={styles.badgeText}>Destaque</Text></View>}
    </View>
    <View style={styles.metrics}>
      <Text style={[styles.rating, !metrics?.averageRating && styles.ratingEmpty]}>{metrics?.averageRating ? `★ ${metrics.averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · ${metrics.verifiedReviewCount || 0} ${(metrics.verifiedReviewCount || 0) === 1 ? 'avaliação' : 'avaliações'}` : 'Novo profissional · sem avaliações'}</Text>
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
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: '500' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rating: { color: colors.warning, fontSize: 12, fontWeight: '600' },
  ratingEmpty: { color: colors.textMuted, fontWeight: '500' },
  metric: { color: colors.textMuted, fontSize: 12, fontWeight: '400' }
});
