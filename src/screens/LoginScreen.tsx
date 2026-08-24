import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { ApiError } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { formatBrazilianBirthDate, isAdultBirthDate, parseBrazilianBirthDate } from '../utils/birth-date';

type AuthMode = 'login' | 'register';
const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState(''); const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');

  const parsedBirthDate = parseBrazilianBirthDate(birthDate);
  const canSubmit = Boolean(email.trim() && password && (mode === 'login' || (name.trim() && isAdultBirthDate(parsedBirthDate) && passwordPattern.test(password))));

  async function submit() {
    if (!canSubmit || loading) return;
    setLoading(true); setError('');
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(name.trim(), email.trim(), password, parsedBirthDate);
    } catch (authError) {
      setError(authError instanceof ApiError ? authError.message : 'Não foi possível concluir o acesso.');
    } finally { setLoading(false); }
  }

  function changeMode(nextMode: AuthMode) { setMode(nextMode); setError(''); }

  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Screen>
    <View style={styles.brand}><Image source={require('../../assets/home-easy-logo-v2.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Home Easy" /></View>
    <SectionHeader eyebrow="Bem-vindo" title="Sua casa mais simples de cuidar." description="Entre para contratar profissionais, conversar e acompanhar seus pedidos." />
    <View style={styles.benefits}><Text style={styles.benefit}>✓ Profissionais avaliados</Text><Text style={styles.benefit}>✓ Contato direto</Text><Text style={styles.benefit}>✓ Pedidos em um só lugar</Text></View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Acesse sua conta</Text>
      <View style={styles.tabs}><Pressable onPress={() => changeMode('login')} style={[styles.tab, mode === 'login' && styles.activeTab]}><Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Entrar</Text></Pressable><Pressable onPress={() => changeMode('register')} style={[styles.tab, mode === 'register' && styles.activeTab]}><Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Criar conta</Text></Pressable></View>
      {mode === 'register' && <><Text style={styles.label}>Nome</Text><TextInput autoComplete="name" value={name} onChangeText={setName} style={styles.input} /><Text style={styles.label}>Data de nascimento</Text><TextInput keyboardType="number-pad" maxLength={10} placeholder="dd/mm/aaaa" value={birthDate} onChangeText={value => setBirthDate(formatBrazilianBirthDate(value))} style={styles.input} /><Text style={styles.help}>É necessário ter pelo menos 18 anos.</Text></>}
      <Text style={styles.label}>E-mail</Text><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
      <Text style={styles.label}>Senha</Text><TextInput secureTextEntry autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChangeText={setPassword} style={styles.input} />
      {mode === 'register' && <Text style={styles.help}>Use 8 ou mais caracteres, com maiúscula, minúscula e número.</Text>}
      {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <AppButton label={mode === 'login' ? 'Entrar' : 'Criar conta'} onPress={submit} loading={loading} disabled={!canSubmit} />
      {mode === 'login' && <Pressable onPress={() => navigation.navigate('ForgotPassword')}><Text style={styles.recovery}>Esqueci minha senha</Text></Pressable>}
    </View>
  </Screen></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, brand: { alignItems: 'center', marginTop: 12 }, logo: { width: 150, height: 112 }, benefits: { gap: 8 }, benefit: { color: colors.textMuted, fontWeight: '600' }, card: { gap: 10, padding: 18, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, cardTitle: { color: colors.text, fontSize: 22, fontWeight: '800' }, tabs: { flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: colors.background }, tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 11 }, activeTab: { backgroundColor: colors.surface }, tabText: { color: colors.textMuted, fontWeight: '700' }, activeTabText: { color: colors.primary }, label: { color: colors.text, fontSize: 13, fontWeight: '700' }, input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.background }, help: { color: colors.textMuted, fontSize: 12, lineHeight: 17 }, error: { color: colors.danger, lineHeight: 20 }, recovery: { color: colors.primary, textAlign: 'center', padding: 8, fontWeight: '700' } });
