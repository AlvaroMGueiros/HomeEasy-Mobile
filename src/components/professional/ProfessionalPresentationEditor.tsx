import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError, apiRequest } from '../../api/api-client';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { Professional, ProfessionalPhotoKind } from '../../types/api';
import { resolvePublicMediaUrl } from '../../utils/media-url';
import { chooseProfessionalImage } from '../../utils/professionalMedia';
import { AppButton } from '../ui/AppButton';
import { FormField } from '../ui/FormField';
import { StateView } from '../ui/StateView';
import { UserAvatar } from '../ui/UserAvatar';
import { ProfessionalPhotoUpload } from './ProfessionalPhotoUpload';
import { ProfessionalPortfolioPhoto } from './ProfessionalPortfolioPhoto';

type PresentationChanges = Partial<Pick<Professional, 'bio' | 'coverPhotoMediaId' | 'portfolioPhotos'>>;

export function ProfessionalPresentationEditor() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [needsProfessionalProfile, setNeedsProfessionalProfile] = useState(false);
  const busy = saving || uploading;

  async function loadProfile() {
    setLoading(true); setError(''); setNeedsProfessionalProfile(false);
    try { const profile = await apiRequest<Professional>('/professionals/me'); setProfessional(profile); setBio(profile.bio || ''); }
    catch (failure) {
      setNeedsProfessionalProfile(failure instanceof ApiError && failure.status === 404);
      setError(failure instanceof Error ? failure.message : 'Não foi possível carregar sua apresentação profissional.');
    } finally { setLoading(false); }
  }
  useEffect(() => { void loadProfile(); }, []);

  async function savePresentation(changes: PresentationChanges) {
    const updatedProfile = await apiRequest<Professional>('/professionals/me/presentation', { method: 'PATCH', body: JSON.stringify(changes) });
    setProfessional(updatedProfile);
  }

  async function persistChanges(changes: PresentationChanges, showSuccess = false) {
    if (busy) return;
    setSaving(true);
    try { await savePresentation(changes); if (showSuccess) Alert.alert('Sobre atualizado', 'Sua apresentação foi salva no perfil público.'); }
    catch (failure) { Alert.alert('Perfil não atualizado', failure instanceof Error ? failure.message : 'Não foi possível salvar sua apresentação profissional.'); }
    finally { setSaving(false); }
  }

  async function changeCover() {
    if (busy) return;
    setSaving(true);
    try { const mediaId = await chooseProfessionalImage(true); if (mediaId) await savePresentation({ coverPhotoMediaId: mediaId }); }
    catch (failure) { Alert.alert('Capa não atualizada', failure instanceof Error ? failure.message : 'Não foi possível publicar a capa selecionada.'); }
    finally { setSaving(false); }
  }

  if (!professional) return <StateView loading={loading} icon="briefcase" title={needsProfessionalProfile ? 'Crie seu perfil profissional' : 'Apresentação profissional'} message={needsProfessionalProfile ? 'Cadastre seus serviços e sua região de atendimento para personalizar o perfil público.' : error || 'Carregando apresentação...'} actionLabel={needsProfessionalProfile ? 'Cadastrar serviços' : undefined} onAction={needsProfessionalProfile ? () => navigation.navigate('ProfessionalManager') : loadProfile} />;

  const photos = professional.portfolioPhotos || [];
  return <View style={styles.container}>
    <View style={styles.preview}>
      <Pressable accessibilityRole="button" accessibilityLabel="Alterar capa do perfil" disabled={busy} onPress={() => void changeCover()} style={styles.cover}>
        {professional.coverPhotoMediaId ? <Image key={professional.coverPhotoMediaId} source={{ uri: resolvePublicMediaUrl(professional.coverPhotoMediaId) }} style={StyleSheet.absoluteFill} /> : <View style={styles.coverPlaceholder}><Feather name="image" size={30} color={colors.primary} /><Text style={styles.coverHint}>Uma capa para valorizar seu trabalho</Text></View>}
        <View style={styles.coverAction}><Feather name="camera" size={15} color={colors.primary} /><Text style={styles.coverActionLabel}>{professional.coverPhotoMediaId ? 'Alterar capa' : 'Adicionar capa'}</Text></View>
      </Pressable>
      <View style={styles.identity}><UserAvatar name={professional.name} mediaId={professional.profilePhotoMediaId} size={60} /><View style={styles.identityCopy}><Text style={styles.name}>{professional.name}</Text><Text style={styles.help}>Seu perfil público no Home Easy</Text></View></View>
      {professional.coverPhotoMediaId && <AppButton label="Remover capa" variant="secondary" disabled={busy} onPress={() => void persistChanges({ coverPhotoMediaId: null })} />}
    </View>
    <View style={styles.card}>
      <View style={styles.sectionHeading}><Feather name="edit-3" size={20} color={colors.primary} /><Text style={styles.heading}>Sobre meu trabalho</Text></View>
      <Text style={styles.description}>Apresente sua experiência, suas especialidades e o cuidado que você oferece em cada atendimento.</Text>
      <FormField label="Sua apresentação" value={bio} onChangeText={setBio} multiline maxLength={2000} editable={!busy} placeholder="Conte aos clientes por que escolher seu trabalho..." />
      <View style={styles.characterCount}><Text style={styles.help}>Mínimo de 40 caracteres</Text><Text style={styles.help}>{bio.trim().length}/2.000</Text></View>
      <AppButton label="Salvar apresentação" loading={saving} disabled={uploading || bio.trim().length < 40 || bio.trim() === professional.bio?.trim()} onPress={() => void persistChanges({ bio: bio.trim() }, true)} />
    </View>
    <View style={styles.card}>
      <View style={styles.sectionHeading}><Feather name="grid" size={20} color={colors.primary} /><Text style={styles.heading}>Portfólio de serviços</Text><Text style={styles.counter}>{photos.length}/30</Text></View>
      <ProfessionalPhotoUpload description="Adicione exemplos dos serviços que você oferece." disabled={saving || photos.length >= 30} onBusyChange={setUploading} onPublish={(mediaId, caption) => savePresentation({ portfolioPhotos: [...photos, { mediaId, kind: ProfessionalPhotoKind.Offered, caption }] })} />
      <View style={styles.notice}><Feather name="check-circle" size={18} color={colors.success} /><Text style={styles.noticeText}>Fotos de serviços concluídos são adicionadas na página do pedido, depois de concluir o atendimento.</Text></View>
    </View>
    {!photos.length && <View style={styles.empty}><Feather name="image" size={28} color={colors.textMuted} /><Text style={styles.heading}>Seu portfólio começa aqui</Text><Text style={styles.description}>Mostre seus serviços para ajudar os clientes a conhecer seu trabalho.</Text></View>}
    {photos.map(photo => <View key={photo.mediaId} style={styles.card}><ProfessionalPortfolioPhoto photo={photo} /><AppButton label="Remover do portfólio" variant="secondary" disabled={busy} onPress={() => Alert.alert('Remover foto?', 'Esta foto deixará de aparecer no seu perfil público.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => void persistChanges({ portfolioPhotos: photos.filter(currentPhoto => currentPhoto.mediaId !== photo.mediaId) }) }])} /></View>)}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: 18 }, preview: { gap: 16, paddingBottom: 16, overflow: 'hidden', borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, cover: { height: 160, backgroundColor: colors.primarySoft, justifyContent: 'center' }, coverPlaceholder: { alignItems: 'center', gap: 8, paddingBottom: 32 }, coverHint: { color: colors.primary, fontSize: 12 }, coverAction: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', gap: 7, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: colors.surface }, coverActionLabel: { color: colors.primary, fontWeight: '800', fontSize: 12 }, identity: { paddingHorizontal: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }, identityCopy: { flex: 1, gap: 5 }, name: { color: colors.text, fontSize: 18, fontWeight: '800' }, card: { gap: 14, padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, heading: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 20 }, characterCount: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, help: { color: colors.textMuted, fontSize: 12, lineHeight: 18 }, counter: { color: colors.primary, fontSize: 12, fontWeight: '800' }, notice: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.successSoft }, noticeText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 19 }, empty: { gap: 10, padding: 20, alignItems: 'center' } });
