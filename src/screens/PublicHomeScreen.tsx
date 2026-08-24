import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

export function PublicHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return <Screen>
    <View style={styles.container}>
      <Image source={require('../../assets/home-easy-logo-v2.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Home Easy" />
      <View style={styles.copy}>
        <Text style={styles.title}>Serviços para sua casa, de um jeito simples.</Text>
        <Text style={styles.description}>Encontre profissionais ou ofereça seus serviços pela Home Easy.</Text>
      </View>
      <View style={styles.actions}>
        <AppButton label="Ver serviços" onPress={() => navigation.navigate('Services')} />
        <AppButton label="Entrar" variant="secondary" onPress={() => navigation.navigate('Login', { mode: 'login' })} />
        <AppButton label="Criar conta" variant="secondary" onPress={() => navigation.navigate('Login', { mode: 'register' })} />
        <AppButton label="Quero oferecer serviços" variant="secondary" onPress={() => navigation.navigate('BecomeProfessional')} />
      </View>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 30, paddingVertical: 28 },
  logo: { width: 180, height: 150, alignSelf: 'center' },
  copy: { alignItems: 'center', gap: 10 },
  title: { maxWidth: 340, color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: '900', textAlign: 'center' },
  description: { maxWidth: 320, color: colors.textMuted, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  actions: { gap: 10 }
});
