import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Switch, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SelectField } from '../components/ui/SelectField';
import { StateView } from '../components/ui/StateView';
import { ProfileEditorSection, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Professional } from '../types/api';
import { resolvePublicMediaUrl } from '../utils/media-url';

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
    <SectionHeader title="Publicar trabalho" />
    <SelectField required label="Serviço" value={serviceId} onChange={setServiceId} options={activeServices.map(service => ({ value: service.id, label: service.name }))} disabled={saving} />
    <FormField required label="Título" value={title} onChangeText={setTitle} placeholder="Ex.: Montagem de guarda-roupa" maxLength={80} editable={!saving} />
    <FormField required label="Sobre o trabalho" value={description} onChangeText={setDescription} placeholder="Conte o que foi feito ou o serviço que você oferece." hint="De 20 a 700 caracteres." maxLength={700} multiline editable={!saving} />
    <AppText style={styles.label}>Fotos do portfólio · {mediaIds.length}/3</AppText>
    <View style={styles.photos}>{photos.map(photo => <Pressable key={photo.mediaId} accessibilityRole="checkbox" accessibilityLabel={photo.caption || 'Selecionar foto do portfólio'} accessibilityState={{ checked: mediaIds.includes(photo.mediaId), disabled: saving }} disabled={saving} onPress={() => selectPhoto(photo.mediaId)} style={[styles.photo, mediaIds.includes(photo.mediaId) && styles.selected]}>
      <Image source={{ uri: resolvePublicMediaUrl(photo.mediaId) }} style={styles.image} />
      {mediaIds.includes(photo.mediaId) && <View style={styles.position}><AppText style={styles.positionText}>{mediaIds.indexOf(photo.mediaId) + 1}</AppText></View>}
    </Pressable>)}</View>
    <View style={styles.consent}><AppText style={styles.consentText}>Tenho autorização para publicar estas fotos e elas não expõem dados privados dos clientes.</AppText><Switch accessibilityLabel="Confirmar autorização para publicar as fotos" value={consent} onValueChange={setConsent} disabled={saving} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} /></View>
    <AppButton label="Enviar para aprovação" loading={saving} onPress={() => void publish()} />
  </Screen>;
}

const styles = StyleSheet.create({ label: { color: colors.text, fontWeight: '700' }, photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, photo: { width: '30%', aspectRatio: 1, borderRadius: 14, borderWidth: 3, borderColor: colors.transparent, overflow: 'hidden' }, selected: { borderColor: colors.primary }, image: { width: '100%', height: '100%', backgroundColor: colors.primarySoft }, position: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }, positionText: { color: colors.white, fontSize: 12, fontWeight: '700' }, consent: { flexDirection: 'row', gap: 12, alignItems: 'center' }, consentText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 20 } });
