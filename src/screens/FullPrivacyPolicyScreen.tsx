import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { colors } from '../theme/colors';

const policySections = [
  {
    title: '1. Dados que tratamos',
    paragraphs: [
      'Podemos tratar dados de cadastro e autenticação, como nome, e-mail, data de nascimento e credenciais protegidas.',
      'Também tratamos informações de perfil, como telefone, endereço, cidade, estado, foto, documentos e dados profissionais fornecidos por você.',
      'Durante o uso do Home Easy, podemos tratar localização, solicitações, propostas, pedidos, agenda, mensagens, avaliações, denúncias, disputas, fotos e arquivos enviados.',
      'Dados técnicos e de segurança, como identificadores de sessão, registros de acesso e informações do dispositivo, podem ser usados para proteger sua conta e a plataforma.'
    ]
  },
  {
    title: '2. Como usamos os dados',
    paragraphs: [
      'Usamos essas informações para criar e autenticar contas, conectar clientes e profissionais, executar os recursos do aplicativo, prestar suporte, prevenir fraudes, manter a segurança e cumprir obrigações legais.'
    ]
  },
  {
    title: '3. Compartilhamento',
    paragraphs: [
      'Não vendemos dados pessoais. Compartilhamos apenas o necessário com participantes de uma contratação e com fornecedores que operam serviços de infraestrutura, banco de dados, armazenamento e e-mail em nosso nome.',
      'Também poderemos compartilhar informações quando houver obrigação legal, solicitação de autoridade competente ou necessidade de proteger direitos e prevenir atividades ilícitas.'
    ]
  },
  {
    title: '4. Armazenamento e segurança',
    paragraphs: [
      'Adotamos conexão criptografada, autenticação por tokens, controle de acesso e proteção de arquivos privados. Nenhum sistema é totalmente imune a riscos, mas revisamos as medidas técnicas e organizacionais aplicadas à plataforma.'
    ]
  },
  {
    title: '5. Exclusão e retenção',
    paragraphs: [
      'Você pode solicitar a exclusão da conta pelo aplicativo ou pela página pública de exclusão. Após a confirmação, o acesso é revogado e os dados pessoais são apagados ou anonimizados.',
      'Registros estritamente necessários poderão ser mantidos pelo período exigido para segurança, prevenção a fraudes, disputas, exercício de direitos ou cumprimento de obrigações legais.'
    ]
  },
  {
    title: '6. Seus direitos',
    paragraphs: [
      'Você pode solicitar confirmação do tratamento, acesso, correção, portabilidade, informação sobre compartilhamento e exclusão dos dados, observados os limites e prazos previstos na legislação aplicável.'
    ]
  },
  {
    title: '7. Público do aplicativo',
    paragraphs: [
      'O Home Easy é destinado a pessoas com 18 anos ou mais. Não coletamos intencionalmente dados de crianças.'
    ]
  },
  {
    title: '8. Contato',
    paragraphs: [
      'Para dúvidas ou solicitações relacionadas à privacidade, entre em contato pelo e-mail contatohomeeasy@gmail.com.'
    ]
  }
] as const;

export function FullPrivacyPolicyScreen() {
  return <Screen>
    <SectionHeader eyebrow="Política de privacidade" title="Política completa" description="Última atualização: 8 de setembro de 2026." />
    <View style={styles.introduction}>
      <Text style={styles.text}>Esta política explica como o Home Easy coleta, utiliza, compartilha, protege e elimina dados pessoais durante o uso do aplicativo e de seus serviços.</Text>
    </View>
    {policySections.map((section) => <View key={section.title} style={styles.section}>
      <Text style={styles.title}>{section.title}</Text>
      {section.paragraphs.map((paragraph) => <Text key={paragraph} style={styles.text}>{paragraph}</Text>)}
    </View>)}
  </Screen>;
}

const styles = StyleSheet.create({
  introduction: { padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  section: { gap: 10 },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  text: { color: colors.textMuted, lineHeight: 22 }
});
