import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ApiError } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function submit() {
    if (!email.trim() || loading) return;
    setLoading(true);
    setMessage('');
    try {
      await requestPasswordReset(email.trim());
      setIsError(false);
      setMessage('Enviamos o link de recuperação. Confira sua caixa de entrada e a pasta de spam.');
    } catch (requestError) {
      setIsError(true);
      setMessage(requestError instanceof ApiError ? requestError.message : 'Não foi possível enviar o link de recuperação.');
    } finally {
      setLoading(false);
    }
  }

  return <AuthLayout title="Recupere seu acesso." description="Enviaremos um link seguro para o e-mail da sua conta.">
    <Text style={styles.title}>Redefinir senha</Text>
    <Text style={styles.label}>E-mail</Text>
    <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
    {Boolean(message) && <Text accessibilityRole="alert" style={isError ? styles.error : styles.success}>{message}</Text>}
    <AppButton label="Enviar link" onPress={submit} loading={loading} disabled={!email.trim()} />
    <AppButton label="Voltar para entrar" variant="secondary" onPress={() => navigation.navigate('Login')} />
  </AuthLayout>;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  label: { color: colors.text, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.background },
  error: { color: colors.danger, lineHeight: 20 },
  success: { color: colors.success, lineHeight: 20 }
});
