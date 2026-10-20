import { StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { resolveProfessionalVerification } from '../../utils/professionalVerification';
import { AppText } from '../ui/AppText';

export function ProfessionalVerificationDetails({ professional }: { professional: Professional }) {
  const checks = resolveProfessionalVerification(professional);
  const rows = [ { label: 'Identidade', verified: checks.identity }, { label: 'Comprovante de endereço', verified: checks.address }, { label: 'Certificado profissional', verified: checks.certificate }, { label: 'Telefone', verified: false } ];
  return <View style={styles.card}>
    <AppText style={styles.heading}>Verificações</AppText>
    {rows.map(check => <View key={check.label} style={styles.row}><AppText style={styles.label}>{check.label}</AppText><AppText style={[styles.status, check.verified && styles.verified]}>{check.verified ? 'Verificado' : 'Não verificado'}</AppText></View>)}
    <AppText style={styles.note}>Avaliações são vinculadas a serviços concluídos no aplicativo.</AppText>
  </View>;
}

const styles = StyleSheet.create({ card: { padding: 16, gap: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, heading: { color: colors.text, fontWeight: '800', fontSize: 17 }, row: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' }, label: { color: colors.text, flex: 1, fontSize: 13 }, status: { color: colors.textMuted, fontSize: 12 }, verified: { color: colors.success, fontWeight: '700' }, note: { color: colors.textMuted, fontSize: 12, lineHeight: 18 } });
