import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { isPlusBillingConfigured } from '../api/subscriptions';
import { HighlightCard } from '../components/professional/HighlightCard';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Professional } from '../types/api';
import { HighlightSummary } from '../types/highlights';
import { resolveHighlightStatus } from '../utils/highlights';

export function MyHighlightsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [publications, setPublications] = useState<HighlightSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState('');
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true; setLoading(true); setError('');
    void Promise.all([apiRequest<Professional>('/professionals/me'), apiRequest<HighlightSummary[]>('/highlights/me')]).then(([profile, highlights]) => {
      if (active) { setProfessional(profile); setPublications(highlights); }
    }).catch(() => { if (active) setError('Não foi possível carregar suas publicações. Confira se seu perfil profissional está cadastrado.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshVersion]));

  async function remove(publicationId: string) {
    if (removingId) return;
    setRemovingId(publicationId);
    try { await apiRequest(`/highlights/${publicationId}`, { method: 'DELETE' }); setPublications(current => current.filter(publication => publication.id !== publicationId)); }
    catch (failure) { Alert.alert('Publicação não removida', failure instanceof Error ? failure.message : 'Não foi possível remover esta publicação.'); }
    finally { setRemovingId(''); }
  }

  return <Screen>
    <SectionHeader title="Minhas publicações" />
    {isPlusBillingConfigured() && professional && (professional.publicationLimit || 4) === 4 && publications.length >= 4 && <AppButton label="Mais publicações com HomeEasy+" variant="secondary" onPress={() => navigation.navigate('HomeEasyPlus')} />}
    <AppButton label="Publicar trabalho" onPress={() => navigation.navigate('CreateHighlight')} disabled={loading || Boolean(removingId)} />
    {loading && <StateView loading message="Carregando publicações..." />}
    {error && <StateView message={error} onAction={() => setRefreshVersion(current => current + 1)} />}
    {!loading && !error && !publications.length && <StateView icon="star" title="Mostre seu trabalho" message="Escolha fotos do portfólio e envie sua primeira publicação para análise." />}
    {!loading && !error && professional && publications.map(publication => <View key={publication.id} style={styles.publication}>
      <View style={styles.status}><AppText style={styles.statusText}>{resolveHighlightStatus(publication.status)}</AppText></View>
      <HighlightCard highlight={{ ...publication, professional }} showActions={false} />
      {Boolean(publication.reviewNotes) && <AppText style={styles.note}>{publication.reviewNotes}</AppText>}
      <AppButton label="Remover publicação" variant="secondary" loading={removingId === publication.id} disabled={Boolean(removingId)} onPress={() => Alert.alert('Remover publicação?', 'Ela deixará de aparecer na vitrine.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => void remove(publication.id) }])} />
    </View>)}
  </Screen>;
}

const styles = StyleSheet.create({ publication: { gap: 12, marginBottom: 16 }, status: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.primarySoft, borderRadius: 12 }, statusText: { color: colors.primary, fontSize: 12, fontWeight: '700' }, note: { color: colors.textMuted, lineHeight: 20, fontSize: 13 } });
