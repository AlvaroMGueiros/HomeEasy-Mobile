import { StyleSheet, View } from 'react-native';

import { AppText as Text } from '../components/ui/AppText';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { colors } from '../theme/colors';

const team = [{ initials: 'AM', name: 'Álvaro Miguel', role: 'Design de produto' }, { initials: 'CS', name: 'Carlos Sabino', role: 'Estratégia e operações' }, { initials: 'PS', name: 'Péricles Soares', role: 'Análise e tecnologia' }];

export function AboutScreen() {
  return <Screen>
    <SectionHeader title="Sobre o HomeEasy" />
    <Text style={styles.text}>No HomeEasy, você encontra profissionais para serviços domésticos e reformas, pede orçamentos e acompanha os atendimentos. Profissionais podem cadastrar seus serviços e responder aos pedidos da região.</Text>
    <SectionHeader title="Equipe" />
    {team.map(member => <View key={member.initials} style={styles.member}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{member.initials}</Text></View>
      <View><Text style={styles.name}>{member.name}</Text><Text style={styles.text}>{member.role}</Text></View>
    </View>)}
  </Screen>;
}

const styles = StyleSheet.create({
  text: { color: colors.textMuted, lineHeight: 21 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '900' },
  name: { color: colors.text, fontSize: 16, fontWeight: '800' }
});
