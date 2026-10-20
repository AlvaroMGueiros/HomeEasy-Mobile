import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { AppText as Text } from '../components/ui/AppText';
import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { ProfessionalPresentationEditor } from '../components/professional/ProfessionalPresentationEditor';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { AppButton } from '../components/ui/AppButton';
import { DatePickerField } from '../components/ui/DatePickerField';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { UserAvatar } from '../components/ui/UserAvatar';
import { colors } from '../theme/colors';
import { ProfileEditorSection, RootStackParamList } from '../navigation/types';
import { StatePickerField } from '../components/ui/StatePickerField';
import { formCopy } from '../config/formCopy';
import { UserProfile } from '../types/api';
import { uploadMedia } from '../utils/media-upload';
import { choosePhotos } from '../utils/photo-picker';

export function EditProfileScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'EditProfile'>>();
  const [section, setSection] = useState(params?.section || ProfileEditorSection.Personal);
  useEffect(() => { if (params?.section) setSection(params.section); }, [params?.section]);
  const { updateCurrentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest<UserProfile>('/users/me')
      .then(setProfile)
      .catch(error => Alert.alert('Perfil indisponível', error.message));
  }, []);

  async function choosePhoto() {
    if (!profile) return;
    const result = await choosePhotos({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setLoading(true);
    try {
      const mediaId = await uploadMedia(
        asset.uri,
        asset.fileName || 'foto-perfil.jpg',
        asset.mimeType || 'image/jpeg',
        'profile_photo'
      );
      const updated = await apiRequest<UserProfile>('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ profilePhotoMediaId: mediaId })
      });
      setProfile(updated);
    } catch (error) {
      Alert.alert('Foto não alterada', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!profile) return;
    setLoading(true);
    try {
      const updated = await apiRequest<UserProfile>('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone?.replace(/\D/g, '') || null,
          birthDate: profile.birthDate || null,
          address: profile.address || null,
          city: profile.city || null,
          state: profile.state?.toUpperCase() || null,
          instagram: profile.instagram || null,
          website: profile.website || null,
          linkedin: profile.linkedin || null
        })
      });
      setProfile(updated);
      await updateCurrentUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role
      });
      Alert.alert('Perfil atualizado', 'Suas informações foram salvas.');
    } catch (error) {
      Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Revise os campos.');
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return (
      <Screen>
        <Text style={styles.loading}>Carregando perfil...</Text>
      </Screen>
    );
  }

  const update = (key: keyof UserProfile, value: string) =>
    setProfile(current => (current ? { ...current, [key]: value } : current));

  return (
    <Screen>
      <SectionHeader
        eyebrow="Minha conta"
        title="Editar perfil"
      />
      <ChoiceChips value={section} onChange={setSection} options={[{ value: ProfileEditorSection.Personal, label: 'Dados pessoais' }, { value: ProfileEditorSection.Professional, label: 'Perfil profissional' }]} />
      {section === ProfileEditorSection.Professional ? <ProfessionalPresentationEditor /> : <>
        <UserAvatar name={profile.name} mediaId={profile.profilePhotoMediaId} size={104} />
        <Pressable style={styles.photoButton} onPress={choosePhoto}>
          <Text style={styles.photoLabel}>Alterar foto</Text>
        </Pressable>
        <FormField {...formCopy.name} required value={profile.name} onChangeText={value => update('name', value)} />
        <FormField
          {...formCopy.phone}
          value={profile.phone || ''}
          onChangeText={value => update('phone', value)}
          keyboardType="phone-pad"
        />
        <DatePickerField
          label="Data de nascimento"
          value={profile.birthDate || ''}
          onChange={value => update('birthDate', value)}
          maximumDate={new Date()}
        />
        <FormField
          {...formCopy.address}
          label={`${formCopy.address.label} (opcional)`}
          value={profile.address || ''}
          onChangeText={value => update('address', value)}
        />
        <FormField
          {...formCopy.city}
          label="Cidade (opcional)"
          value={profile.city || ''}
          onChangeText={value => update('city', value)}
        />
        <StatePickerField value={profile.state || ''} onChange={value => update('state', value)} />
        <FormField
          label="Instagram (opcional)" placeholder="Ex.: @maria.servicos" autoCapitalize="none" autoCorrect={false}
          value={profile.instagram || ''}
          onChangeText={value => update('instagram', value)}
        />
        <FormField
          label="Seu site (opcional)" placeholder="Ex.: https://meuservico.com.br" autoCapitalize="none" autoCorrect={false} keyboardType="url"
          value={profile.website || ''}
          onChangeText={value => update('website', value)}
        />
        <FormField
          label="LinkedIn (opcional)" placeholder="Cole o link do seu perfil" autoCapitalize="none" autoCorrect={false} keyboardType="url"
          value={profile.linkedin || ''}
          onChangeText={value => update('linkedin', value)}
        />
        <AppButton label="Salvar dados pessoais" onPress={save} loading={loading} />
      </>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { color: colors.textMuted },
  photoButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary
  },
  photoLabel: { color: colors.primary, fontWeight: '800' }
});

