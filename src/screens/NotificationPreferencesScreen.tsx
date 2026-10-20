import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { colors } from '../theme/colors';
import { NotificationPreferences } from '../types/api';

const preferenceLabels: Array<{ key: keyof NotificationPreferences; label: string }> = [
  { key: 'pushEnabled', label: 'Receber notificações no celular' },
  { key: 'messages', label: 'Mensagens' },
  { key: 'quotes', label: 'Orçamentos recebidos' },
  { key: 'serviceUpdates', label: 'Atendimentos e suporte' },
  { key: 'reviews', label: 'Avaliações' },
  { key: 'opportunities', label: 'Novos pedidos de serviço' },
];

export function NotificationPreferencesScreen() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { setPreferences(await apiRequest<NotificationPreferences>('/notifications/preferences')); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível consultar suas preferências de notificações.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function save() {
    if (!preferences || saving) return;
    setSaving(true);
    try {
      setPreferences(await apiRequest<NotificationPreferences>('/notifications/preferences', { method: 'PUT', body: JSON.stringify(preferences) }));
      Alert.alert('Preferências salvas');
    } catch (failure) { Alert.alert('Preferências não salvas', failure instanceof Error ? failure.message : 'Não foi possível salvar suas preferências.'); }
    finally { setSaving(false); }
  }

  return <Screen>
    <SectionHeader title="Avisos no celular" />
    {!preferences && <StateView loading={loading} message={error || 'Carregando preferências...'} onAction={error ? load : undefined} />}
    {preferences && <>
      {preferenceLabels.map(preference => <View key={preference.key} style={styles.row}>
        <AppText style={styles.label}>{preference.label}</AppText>
        <Switch accessibilityLabel={preference.label} value={preferences[preference.key]} disabled={saving || (preference.key !== 'pushEnabled' && !preferences.pushEnabled)}
          trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white}
          onValueChange={enabled => setPreferences(current => current ? { ...current, [preference.key]: enabled } : current)} />
      </View>)}
      <AppText style={styles.note}>Os avisos continuam no histórico do app. A permissão de notificações do celular também precisa estar ativada.</AppText>
      <AppButton label="Salvar preferências" loading={saving} onPress={() => void save()} />
    </>}
  </Screen>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: colors.surface, borderRadius: 16 }, label: { flex: 1, color: colors.text, fontWeight: '600' }, note: { color: colors.textMuted, lineHeight: 20, fontSize: 13 } });
