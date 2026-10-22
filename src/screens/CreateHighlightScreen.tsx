import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { HighlightAuthor } from '../components/professional/HighlightAuthor';
import { HighlightPhotoPicker } from '../components/professional/HighlightPhotoPicker';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { AppTextInput } from '../components/ui/AppTextInput';
import { FieldLabel } from '../components/ui/FieldLabel';
import { Screen } from '../components/ui/Screen';
import { SelectField } from '../components/ui/SelectField';
import { StateView } from '../components/ui/StateView';
import { ProfileEditorSection, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Professional } from '../types/api';

export function CreateHighlightScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [serviceId, setServiceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const sending = useRef(false);

  useEffect(() => {
    let active = true;
    void apiRequest<Professional>('/professionals/me').then(profile => { if (active) setProfessional(profile); })
      .catch(() => { if (active) setError('Não foi possível carregar seu perfil profissional.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function selectPhoto(mediaId: string) {
    if (saving) return;
    if (mediaIds.includes(mediaId)) { setMediaIds(current => current.filter(selectedId => selectedId !== mediaId)); return; }
    if (mediaIds.length >= 3) { Alert.alert('Até três fotos', 'Remova uma foto selecionada para escolher outra.'); return; }
    setMediaIds(current => [...current, mediaId]);
  }

  async function publish() {
    if (sending.current) return;
    if (!serviceId || title.trim().length < 5 || description.trim().length < 20 || !mediaIds.length || !consent) {
      Alert.alert('Revise a publicação', 'Escolha o serviço e as fotos, preencha o título e a descrição e confirme a autorização.'); return;
    }
    sending.current = true; setSaving(true);
    try {
      await apiRequest('/highlights', { method: 'POST', body: JSON.stringify({ serviceId, title: title.trim(), description: description.trim(), mediaIds, hasPublicationConsent: consent }) });
      Alert.alert('Publicação enviada', 'Ela aparecerá nos destaques após a aprovação.', [{ text: 'Ver minhas publicações', onPress: () => navigation.goBack() }]);
    } catch (failure) { Alert.alert('Publicação não enviada', failure instanceof Error ? failure.message : 'Não foi possível enviar esta publicação para análise.'); }
    finally { sending.current = false; setSaving(false); }
  }

  const activeServices = professional?.services.filter(service => service.isActive) || [];
  const photos = professional?.portfolioPhotos || [];
  if (loading) return <Screen><StateView loading message="Carregando seu portfólio..." /></Screen>;
  if (!professional || !photos.length || !activeServices.length) return <Screen>
    <StateView icon="image" title="Prepare seu perfil" message={error || 'Adicione fotos ao portfólio e cadastre pelo menos um serviço para publicar.'} />
    <AppButton label="Editar meu perfil profissional" onPress={() => navigation.navigate('EditProfile', { section: ProfileEditorSection.Professional })} />
  </Screen>;

  return <Screen>
    <View style={styles.composer}>
      <View style={styles.author}><HighlightAuthor professional={professional} subtitle="Publicação pública · após aprovação" /></View>
      <View style={styles.writing}>
        <FieldLabel label="Título" required style={styles.fieldLabel} />
        <AppTextInput accessibilityLabel="Título da publicação, obrigatório, mínimo 5 caracteres" value={title} onChangeText={setTitle} placeholder="Dê um título ao seu trabalho" placeholderTextColor={colors.textMuted} maxLength={80} editable={!saving} style={styles.titleInput} />
        <FieldLabel label="Sobre o trabalho" required style={styles.fieldLabel} />
        <AppTextInput accessibilityLabel="Sobre o trabalho, obrigatório, mínimo 20 caracteres" value={description} onChangeText={setDescription} placeholder="Qual trabalho você quer mostrar hoje?" placeholderTextColor={colors.textMuted} maxLength={700} multiline editable={!saving} textAlignVertical="top" style={styles.descriptionInput} />
        <AppText style={styles.counter}>{description.length}/700</AppText>
      </View>
      <View style={styles.attachments}>
        <SelectField required label="Serviço da publicação" placeholder="Qual serviço você realizou?" value={serviceId} onChange={setServiceId} options={activeServices.map(service => ({ value: service.id, label: service.name }))} disabled={saving} />
        <HighlightPhotoPicker photos={photos} selectedIds={mediaIds} disabled={saving} onSelect={selectPhoto} />
      </View>
    </View>
    <Pressable accessibilityRole="checkbox" accessibilityLabel="Tenho autorização para publicar as fotos e não exponho dados privados dos clientes" accessibilityState={{ checked: consent, disabled: saving }} disabled={saving} onPress={() => setConsent(current => !current)} style={styles.consent}>
      <View style={[styles.checkbox, consent && styles.checked]}>{consent && <Feather name="check" size={15} color={colors.white} />}</View>
      <AppText style={styles.consentText}>Tenho autorização para divulgar as fotos, sem dados privados dos clientes.</AppText>
    </Pressable>
    <AppButton label="Publicar trabalho" loading={saving} onPress={() => void publish()} />
    <View style={styles.reviewNote}><Feather name="shield" size={13} color={colors.textMuted} /><AppText style={styles.note}>Sua publicação passa por aprovação.</AppText></View>
  </Screen>;
}

const styles = StyleSheet.create({
  composer: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  author: { padding: 16, flexDirection: 'row' }, writing: { paddingHorizontal: 16 },
  fieldLabel: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  titleInput: { color: colors.text, fontSize: 20, fontWeight: '700', paddingVertical: 10 },
  descriptionInput: { color: colors.text, fontSize: 17, lineHeight: 27, minHeight: 156, paddingTop: 8, paddingBottom: 12 },
  counter: { color: colors.textMuted, fontSize: 11, textAlign: 'right', paddingBottom: 14 },
  attachments: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, padding: 16, gap: 18 },
  consent: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 48 }, consentText: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 19 },
  checkbox: { width: 22, height: 22, borderWidth: 1.5, borderColor: colors.textMuted, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  reviewNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, note: { color: colors.textMuted, fontSize: 11 },
});
