import { PropsWithChildren, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText as Text } from './AppText';
import { colors } from '../../theme/colors';
import { acceptCommunityRules, hasAcceptedCommunityRules } from '../../utils/communityRules';
import { AppButton } from './AppButton';
import { CommunityRulesContent } from './CommunityRulesContent';
import { StateView } from './StateView';

export function CommunityRulesGate({ userId, onDecline, children }: PropsWithChildren<{ userId: string; onDecline(): void }>) {
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    hasAcceptedCommunityRules(userId).then(value => { if (active) setAccepted(value); }).catch(() => { if (active) setAccepted(false); });
    return () => { active = false; };
  }, [userId]);

  async function accept() {
    if (saving) return;
    setSaving(true);
    try { await acceptCommunityRules(userId); setAccepted(true); }
    catch { Alert.alert('Aceite não salvo', 'Não foi possível salvar o aceite neste aparelho. Tente novamente.'); }
    finally { setSaving(false); }
  }

  if (accepted) return children;
  return <Modal visible animationType="slide" onRequestClose={() => undefined}>
    <View style={[styles.sheet, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
      {accepted === null ? <StateView loading message="Conferindo as regras de uso..." /> : <>
        <ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Antes de continuar</Text><Text style={styles.description}>Leia e aceite as regras para usar o HomeEasy e publicar conteúdo.</Text><CommunityRulesContent /><AppButton label="Li e aceito as regras" onPress={() => void accept()} loading={saving} /><AppButton label="Não aceitar e sair" variant="secondary" onPress={onDecline} disabled={saving} /></ScrollView>
      </>}
    </View>
  </Modal>;
}

const styles = StyleSheet.create({ sheet: { flex: 1, paddingHorizontal: 20, backgroundColor: colors.background }, content: { gap: 18, paddingVertical: 16 }, title: { color: colors.text, fontSize: 24, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 14, lineHeight: 21 } });
