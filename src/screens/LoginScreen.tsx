import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { colors } from '../theme/colors';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  async function submit() { setLoading(true); setError(''); try { await login(email.trim(), password); } catch (loginError) { setError(loginError instanceof ApiError ? loginError.message : 'Não foi possível entrar.'); } finally { setLoading(false); } }
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Screen>
    <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>HE</Text></View><Text style={styles.brandText}>home easy</Text></View>
    <SectionHeader eyebrow="Bem-vindo" title="Sua casa mais simples de cuidar." description="Entre para contratar profissionais e acompanhar seus pedidos." />
    <View style={styles.card}><Text style={styles.label}>E-mail</Text><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} /><Text style={styles.label}>Senha</Text><TextInput secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />{Boolean(error) && <Text style={styles.error}>{error}</Text>}<AppButton label="Entrar" onPress={submit} loading={loading} disabled={!email || !password} /></View>
  </Screen></KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ flex: { flex: 1 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 30 }, mark: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, markText: { color: colors.white, fontWeight: '900' }, brandText: { color: colors.primaryStrong, fontSize: 24, fontWeight: '800' }, card: { gap: 10, padding: 18, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, label: { color: colors.text, fontSize: 13, fontWeight: '700' }, input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.background }, error: { color: colors.danger, lineHeight: 20 } });
