import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText as Text } from '../components/ui/AppText';
import { FormField } from '../components/ui/FormField';
import { formCopy } from '../config/formCopy';
import { ApiError } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

export function ResetPasswordScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { resetPassword } = useAuth();
  const [token, setToken] = useState(route.params?.token || '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [changed, setChanged] = useState(false);
  const valid = Boolean(token.trim() && passwordPattern.test(password) && password === confirmation);

  async function submit() {
    if (!valid || loading) return;
    setLoading(true);
    setMessage('');
    try {
      await resetPassword(token.trim(), password);
      setChanged(true);
      setMessage('Senha atualizada. Você já pode entrar com a nova senha.');
    } catch (resetError) {
      setMessage(resetError instanceof ApiError ? resetError.message : 'O link de recuperação expirou ou já foi utilizado.');
    } finally {
      setLoading(false);
    }
  }

  return <AuthLayout title="Criar nova senha">
    <Text style={styles.title}>{changed ? 'Senha atualizada' : 'Proteja sua conta'}</Text>
    {!changed && <>
      {!route.params?.token && <FormField required label="Código de recuperação" autoCapitalize="none" autoCorrect={false} hint="Código recebido por e-mail." value={token} onChangeText={setToken} />}
      <FormField required label="Crie uma nova senha" hint={formCopy.passwordHint} secureTextEntry autoComplete="new-password" value={password} onChangeText={setPassword} />
      <FormField required label="Digite a nova senha outra vez" secureTextEntry autoComplete="new-password" value={confirmation} onChangeText={setConfirmation} />
      {Boolean(confirmation) && password !== confirmation && <Text accessibilityRole="alert" style={styles.error}>As senhas estão diferentes. Digite a mesma senha nos dois campos.</Text>}
      <AppButton label="Atualizar senha" onPress={submit} loading={loading} disabled={!valid} />
    </>}
    {Boolean(message) && <Text accessibilityRole="alert" style={changed ? styles.success : styles.error}>{message}</Text>}
    {changed && <AppButton label="Entrar" onPress={() => navigation.navigate('Login')} />}
  </AuthLayout>;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  label: { color: colors.text, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.text, backgroundColor: colors.background },
  help: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  error: { color: colors.danger, lineHeight: 20 },
  success: { color: colors.success, lineHeight: 20 }
});
