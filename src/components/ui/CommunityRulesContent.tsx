import { StyleSheet, View } from 'react-native';

import { AppText as Text } from './AppText';
import { communityRules, communityRulesVersion } from '../../config/communityRules';
import { colors } from '../../theme/colors';

export function CommunityRulesContent() {
  return <View style={styles.content}>
    <Text style={styles.description}>Estas regras valem para perfis, fotos, pedidos, orçamentos, avaliações e conversas. Versão: {communityRulesVersion}.</Text>
    {communityRules.map(rule => <View key={rule.title} style={styles.card}><Text style={styles.title}>{rule.title}</Text><Text style={styles.description}>{rule.description}</Text></View>)}
  </View>;
}

const styles = StyleSheet.create({ content: { gap: 14 }, card: { gap: 8, padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, title: { color: colors.text, fontSize: 16, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 20 } });
