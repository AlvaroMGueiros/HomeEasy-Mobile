import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { environment } from '../config/environment';
import { colors } from '../theme/colors';
import { openExternalLink } from '../utils/external-link';

export function PrivacyPolicyScreen() {
  async function openLink(url: string) {
    try {
      await openExternalLink(url);
    } catch (error) {
      Alert.alert('Não foi possível abrir o endereço', error instanceof Error ? error.message : 'Tente novamente mais tarde.');
    }
  }

  return <Screen>
    <SectionHeader eyebrow="Privacidade e dados" title="Como cuidamos das suas informações" description="Última atualização: 8 de setembro de 2026." />
    <View style={styles.card}>
      <Text style={styles.title}>Dados utilizados</Text>
      <Text style={styles.text}>Tratamos os dados de cadastro, perfil, localização, solicitações, propostas, pedidos, mensagens, avaliações e arquivos necessários para prestar e proteger os serviços do Home Easy.</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.title}>Uso e compartilhamento</Text>
      <Text style={styles.text}>Os dados são usados para autenticação, conexão entre clientes e profissionais, suporte, segurança e cumprimento de obrigações legais. Não vendemos dados pessoais.</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.title}>Seus direitos</Text>
      <Text style={styles.text}>Você pode solicitar acesso, correção e exclusão dos seus dados. Alguns registros podem ser preservados somente quando necessários para segurança, disputas ou obrigações legais.</Text>
    </View>
    <AppButton label="Ler política completa" onPress={() => void openLink(environment.privacyPolicyUrl)} />
    <AppButton label="Excluir conta sem acesso ao app" variant="secondary" onPress={() => void openLink(environment.accountDeletionUrl)} />
  </Screen>;
}

const styles = StyleSheet.create({
  card: { gap: 8, padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  text: { color: colors.textMuted, lineHeight: 22 }
});
