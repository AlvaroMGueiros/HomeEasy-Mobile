import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { HighlightGallery } from '../components/professional/HighlightGallery';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { colors } from '../theme/colors';
import { HighlightStatus, ModerationHighlight } from '../types/highlights';

export function HighlightsModerationScreen() {
  const [publications, setPublications] = useState<ModerationHighlight[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState('');
  const [error, setError] = useState('');
  async function load() {
    setLoading(true); setError('');
    try { setPublications(await apiRequest<ModerationHighlight[]>('/highlights/moderation')); }
    catch { setError('Não foi possível consultar as publicações pendentes.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function review(publicationId: string, status: HighlightStatus) {
    if (reviewingId) return;
    const note = notes[publicationId]?.trim();
    if (status === HighlightStatus.Rejected && (!note || note.length < 5)) { Alert.alert('Informe o motivo', 'Explique ao profissional por que a publicação não foi aprovada.'); return; }
    setReviewingId(publicationId);
    try {
      await apiRequest(`/highlights/${publicationId}/review`, { method: 'PATCH', body: JSON.stringify({ status, notes: note || undefined }) });
      setPublications(current => current.filter(publication => publication.id !== publicationId));
    } catch (failure) { Alert.alert('Análise não salva', failure instanceof Error ? failure.message : 'Não foi possível revisar esta publicação.'); }
    finally { setReviewingId(''); }
  }
  return <Screen>
    <SectionHeader title="Aprovar publicações" />
    <AppButton label="Atualizar lista" variant="secondary" disabled={loading || Boolean(reviewingId)} onPress={() => void load()} />
    {loading && <StateView loading message="Carregando publicações..." />}
    {error && <StateView message={error} onAction={() => void load()} />}
    {!loading && !error && !publications.length && <StateView message="Nenhuma publicação pendente." />}
    {publications.map(publication => <View key={publication.id} style={styles.card}>
      <HighlightGallery mediaIds={publication.mediaIds} title={publication.title} />
      <View style={styles.content}>
        <AppText style={styles.title}>{publication.title}</AppText><AppText style={styles.author}>{publication.professionalName} · {publication.serviceName}</AppText><AppText style={styles.description}>{publication.description}</AppText>
        <FormField label="Observação para o profissional" value={notes[publication.id] || ''} onChangeText={note => setNotes(current => ({ ...current, [publication.id]: note }))} maxLength={2000} multiline editable={!reviewingId} />
        <AppButton label="Aprovar publicação" disabled={Boolean(reviewingId)} onPress={() => void review(publication.id, HighlightStatus.Approved)} />
        <AppButton label="Não aprovar" variant="secondary" disabled={Boolean(reviewingId)} onPress={() => void review(publication.id, HighlightStatus.Rejected)} />
      </View>
    </View>)}
  </Screen>;
}

const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }, content: { padding: 16, gap: 14 }, title: { color: colors.text, fontSize: 19, fontWeight: '800' }, author: { color: colors.textMuted, fontSize: 13 }, description: { color: colors.text, lineHeight: 22 } });
