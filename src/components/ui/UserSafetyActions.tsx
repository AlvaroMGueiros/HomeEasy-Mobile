import { Feather } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText as Text } from './AppText';
import { apiRequest } from '../../api/api-client';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { AppButton } from './AppButton';

export interface UserBlockStatus { isBlocked: boolean; canMessage: boolean; }

export function UserSafetyActions({ targetUserId, conversationId, onStatusChange }: { targetUserId: string; conversationId?: string; onStatusChange?(status: UserBlockStatus | null): void }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [status, setStatus] = useState<UserBlockStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const mutationPending = useRef(false);
  const mutationVersion = useRef(0);
  const statusCallback = useRef(onStatusChange);
  statusCallback.current = onStatusChange;

  useFocusEffect(useCallback(() => {
    let active = true;
    let refreshPending = false;
    setStatus(null); statusCallback.current?.(null);
    async function refresh() {
      if (mutationPending.current || refreshPending) return;
      refreshPending = true;
      const requestVersion = mutationVersion.current;
      try {
        const blockStatus = await apiRequest<UserBlockStatus>(`/blocks/${targetUserId}`);
        if (!active || mutationPending.current || requestVersion !== mutationVersion.current) return;
        setStatus(blockStatus); setError(''); statusCallback.current?.(blockStatus);
      } catch {
        if (!active || mutationPending.current || requestVersion !== mutationVersion.current) return;
        setStatus(null); statusCallback.current?.(null);
        setError('Não foi possível conferir o bloqueio. Toque em Segurança para tentar novamente.');
      } finally { refreshPending = false; }
    }
    void refresh();
    const refreshInterval = conversationId ? setInterval(() => void refresh(), 4000) : undefined;
    return () => { active = false; if (refreshInterval) clearInterval(refreshInterval); };
  }, [targetUserId, conversationId]));

  async function changeBlock(wasBlocked: boolean) {
    if (mutationPending.current) return;
    mutationVersion.current += 1;
    setVisible(false);
    mutationPending.current = true; setBusy(true); statusCallback.current?.(null);
    try {
      await apiRequest(`/blocks/${targetUserId}`, { method: wasBlocked ? 'DELETE' : 'PUT' });
      const blockStatus = await apiRequest<UserBlockStatus>(`/blocks/${targetUserId}`);
      setStatus(blockStatus); setError(''); statusCallback.current?.(blockStatus);
    } catch (failure) {
      setStatus(null); statusCallback.current?.(null);
      setError('Confira o bloqueio novamente antes de enviar mensagens.');
      Alert.alert(wasBlocked ? 'Não foi possível desbloquear' : 'Não foi possível bloquear', failure instanceof Error ? failure.message : 'Confira sua conexão e tente novamente.');
    } finally { mutationPending.current = false; setBusy(false); }
  }

  async function openActions() {
    setVisible(true);
    let blockStatus = status;
    if (!blockStatus) {
      try { blockStatus = await apiRequest<UserBlockStatus>(`/blocks/${targetUserId}`); setStatus(blockStatus); setError(''); statusCallback.current?.(blockStatus); }
      catch { setError('Bloqueio indisponível. Você ainda pode denunciar a pessoa.'); }
    }
  }

  function confirmBlock() {
    if (!status) return;
    const isBlocked = status.isBlocked;
    Alert.alert(isBlocked ? 'Desbloquear esta pessoa?' : 'Bloquear esta pessoa?', isBlocked ? 'As mensagens poderão voltar se a conversa estiver ativa e não houver outro bloqueio.' : 'Vocês não poderão trocar novas mensagens. Para cancelar ou resolver um serviço, abra o atendimento.', [{ text: 'Voltar', style: 'cancel' }, { text: isBlocked ? 'Desbloquear' : 'Bloquear', onPress: () => void changeBlock(isBlocked) }]);
  }

  return <View><Pressable accessibilityRole="button" accessibilityLabel="Segurança: denunciar, bloquear ou desbloquear pessoa" disabled={busy} onPress={() => void openActions()} style={styles.action}><Feather name="shield" size={18} color={colors.primary} /><Text style={styles.label}>{busy ? 'Atualizando...' : 'Segurança'}</Text></Pressable>{Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}><View style={styles.overlay}><View accessibilityViewIsModal style={styles.sheet}>
      <Text style={styles.title}>Segurança</Text><Text style={styles.description}>O bloqueio impede novas mensagens entre vocês. O histórico e os serviços contratados são mantidos.</Text>
      <AppButton label={status?.isBlocked ? 'Desbloquear pessoa' : 'Bloquear pessoa'} variant="secondary" disabled={!status || busy} onPress={confirmBlock} />
      <AppButton label="Denunciar pessoa ou conversa" variant="secondary" onPress={() => { setVisible(false); navigation.navigate('Report', { targetUserId, conversationId }); }} />
      <AppButton label="Regras de uso" variant="secondary" onPress={() => { setVisible(false); navigation.navigate('CommunityRules'); }} />
      <AppButton label="Fechar" onPress={() => setVisible(false)} />
    </View></View></Modal>
  </View>;
}

const styles = StyleSheet.create({ action: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }, label: { color: colors.primary, fontWeight: '800', fontSize: 13 }, error: { color: colors.danger, fontSize: 12, lineHeight: 18 }, overlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.overlay }, sheet: { gap: 14, padding: 20, borderRadius: 22, backgroundColor: colors.background }, title: { color: colors.text, fontSize: 22, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 20 } });
