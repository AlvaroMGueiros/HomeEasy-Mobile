import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { colors } from '../theme/colors';

const confirmationText = 'EXCLUIR';

export function DeleteAccountScreen() {
  const { deleteAccount } = useAuth();
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const canDelete = confirmation.trim().toUpperCase() === confirmationText;

  function confirmDeletion() {
    if (!canDelete || loading) return;
    Alert.alert(
      'Excluir conta permanentemente?',
      'Seu acesso será encerrado e esta ação não poderá ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir conta', style: 'destructive', onPress: () => void submitDeletion() }
      ]
    );
  }

  async function submitDeletion() {
    setLoading(true);
    try {
      await deleteAccount();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Não foi possível excluir sua conta. Tente novamente.';
      Alert.alert('Conta não excluída', message);
      setLoading(false);
    }
  }

  return <Screen>
    <SectionHeader eyebrow="Privacidade e dados" title="Excluir minha conta" description="Revise com atenção antes de continuar." />
    <View style={styles.warning}>
      <Text style={styles.title}>O que acontece depois?</Text>
      <Text style={styles.text}>Seu acesso será revogado e seus dados pessoais, documentos, fotos e anexos serão apagados ou anonimizados.</Text>
      <Text style={styles.text}>Registros indispensáveis para segurança, disputas ou obrigações legais poderão ser mantidos com acesso restrito.</Text>
    </View>
    <Text style={styles.label}>Digite {confirmationText} para confirmar</Text>
    <TextInput autoCapitalize="characters" value={confirmation} onChangeText={setConfirmation} style={styles.input} />
    <AppButton label="Excluir minha conta" variant="danger" disabled={!canDelete} loading={loading} onPress={confirmDeletion} />
  </Screen>;
}

const styles = StyleSheet.create({
  warning: { gap: 10, padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger },
  title: { color: colors.danger, fontSize: 18, fontWeight: '800' },
  text: { color: colors.textMuted, lineHeight: 22 },
  label: { color: colors.text, fontWeight: '700' },
  input: { minHeight: 52, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }
});
