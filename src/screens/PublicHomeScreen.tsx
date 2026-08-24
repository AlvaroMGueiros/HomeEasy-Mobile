import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../components/ui/AppButton';
import { BrandPanel } from '../components/ui/BrandPanel';
import { Screen } from '../components/ui/Screen';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

export function PublicHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return <Screen>
    <View style={styles.container}>
      <BrandPanel title="Serviços para sua casa, de um jeito simples." description="Encontre profissionais avaliados perto de você." />
      <View style={styles.actions}>
        <Text style={styles.actionTitle}>Como deseja continuar?</Text>
        <AppButton label="Ver serviços" onPress={() => navigation.navigate('Services')} />
        <View style={styles.accountActions}>
          <View style={styles.accountAction}><AppButton label="Entrar" variant="secondary" onPress={() => navigation.navigate('Login', { mode: 'login' })} /></View>
          <View style={styles.accountAction}><AppButton label="Criar conta" variant="secondary" onPress={() => navigation.navigate('Login', { mode: 'register' })} /></View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.professionalHint}>Você trabalha com serviços para casa?</Text>
        <AppButton label="Quero oferecer serviços" variant="secondary" onPress={() => navigation.navigate('BecomeProfessional')} />
      </View>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 18, paddingVertical: 16 },
  actions: { gap: 10, padding: 16, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  actionTitle: { marginBottom: 2, color: colors.text, fontSize: 18, fontWeight: '800' },
  accountActions: { flexDirection: 'row', gap: 10 },
  accountAction: { flex: 1 },
  divider: { height: 1, marginVertical: 4, backgroundColor: colors.border },
  professionalHint: { color: colors.textMuted, fontSize: 13, textAlign: 'center' }
});
