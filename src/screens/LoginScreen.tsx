import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FormField } from '../components/ui/FormField';
import { formCopy } from '../config/formCopy';
import { ApiError } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { isValidEmailAddress } from '../utils/formValidation';
import { formatBrazilianBirthDate, isAdultBirthDate, parseBrazilianBirthDate } from '../utils/birth-date';

type AuthMode = 'login' | 'register';
const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>(params?.mode || 'login');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsedBirthDate = parseBrazilianBirthDate(birthDate);
  const canSubmit = Boolean(isValidEmailAddress(email) && password && (mode === 'login' || (name.trim().length >= 3 && isAdultBirthDate(parsedBirthDate) && passwordPattern.test(password))));

  async function submit() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(name.trim(), email.trim(), password, parsedBirthDate);
    } catch (authError) {
      setError(authError instanceof ApiError ? authError.message : 'Não foi possível concluir o acesso.');
    } finally {
      setLoading(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError('');
  }

  const title = mode === 'login' ? 'Que bom ter você de volta.' : 'Crie sua conta Home Easy.';
  const description = mode === 'login' ? 'Acesse seus pedidos, conversas e profissionais.' : 'Use a mesma conta para contratar profissionais ou oferecer seus serviços.';

  return <AuthLayout title={title} description={description}>
    <Text style={styles.cardTitle}>{mode === 'login' ? 'Entrar na sua conta' : 'Começar cadastro'}</Text>
    <View style={styles.tabs}>
      <Pressable onPress={() => changeMode('login')} style={[styles.tab, mode === 'login' && styles.activeTab]}><Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Entrar</Text></Pressable>
      <Pressable onPress={() => changeMode('register')} style={[styles.tab, mode === 'register' && styles.activeTab]}><Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Criar conta</Text></Pressable>
    </View>
    {mode === 'register' && <>
      <FormField {...formCopy.name} required hint="Informe seu nome completo, com pelo menos 3 caracteres." value={name} onChangeText={setName} maxLength={160} />
      <FormField required label="Data de nascimento" keyboardType="number-pad" maxLength={10} placeholder="Ex.: 15/03/1990" hint="Informe dia, mês e ano. Você precisa ter 18 anos ou mais." value={birthDate} onChangeText={value => setBirthDate(formatBrazilianBirthDate(value))} />
    </>}
    <FormField {...formCopy.email} required hint={email.trim() && !isValidEmailAddress(email) ? 'Confira o e-mail. Exemplo: maria@email.com' : undefined} value={email} onChangeText={setEmail} />
    <FormField required label={mode === 'login' ? 'Senha da sua conta' : 'Crie uma senha'} secureTextEntry autoComplete={mode === 'login' ? 'current-password' : 'new-password'} hint={mode === 'register' ? formCopy.passwordHint : undefined} value={password} onChangeText={setPassword} />
    {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <AppButton label={mode === 'login' ? 'Entrar' : 'Criar conta'} onPress={submit} loading={loading} disabled={!canSubmit} />
    {mode === 'login' && <Pressable onPress={() => navigation.navigate('ForgotPassword')}><Text style={styles.recovery}>Esqueci minha senha</Text></Pressable>}
  </AuthLayout>;
}

const styles = StyleSheet.create({
  cardTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: colors.background },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  activeTab: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabText: { color: colors.textMuted, fontWeight: '700' },
  activeTabText: { color: colors.primary },
  label: { color: colors.text, fontSize: 13, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.background },
  help: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  error: { color: colors.danger, lineHeight: 20 },
  recovery: { color: colors.primary, textAlign: 'center', padding: 8, fontWeight: '700' }
});
