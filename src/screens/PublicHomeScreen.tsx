import { SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../components/ui/AppButton';
import { BrandPanel } from '../components/ui/BrandPanel';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

export function PublicHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { height } = useWindowDimensions();
  const landingMinHeight = Math.max(390, height * 0.55);

  return <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
      <BrandPanel landing landingMinHeight={landingMinHeight} title="Serviços para sua casa, de um jeito simples." description="Encontre profissionais avaliados perto de você." />
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
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-start', backgroundColor: colors.surface },
  actions: { gap: 12, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 28, backgroundColor: colors.surface },
  actionTitle: { marginBottom: 2, color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  accountActions: { flexDirection: 'row', gap: 10 },
  accountAction: { flex: 1 },
  divider: { height: 1, marginVertical: 2, backgroundColor: colors.border },
  professionalHint: { color: colors.textMuted, fontSize: 13, textAlign: 'center' }
});
