import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { chooseProfessionalImage } from '../../utils/professionalMedia';
import { AppButton } from '../ui/AppButton';
import { FormField } from '../ui/FormField';

interface ProfessionalPhotoUploadProps {
  description: string;
  disabled?: boolean;
  onPublish(mediaId: string, caption: string): Promise<void>;
  onBusyChange?(busy: boolean): void;
}

export function ProfessionalPhotoUpload({ description, disabled = false, onPublish, onBusyChange }: ProfessionalPhotoUploadProps) {
  const [caption, setCaption] = useState('');
  const [publishing, setPublishing] = useState(false);

  async function publishPhoto() {
    if (publishing || disabled) return;
    setPublishing(true); onBusyChange?.(true);
    try {
      const mediaId = await chooseProfessionalImage();
      if (!mediaId) return;
      await onPublish(mediaId, caption.trim());
      setCaption('');
    } catch (failure) {
      Alert.alert('Foto não publicada', failure instanceof Error ? failure.message : 'Não foi possível enviar e publicar a foto do serviço.');
    } finally { setPublishing(false); onBusyChange?.(false); }
  }

  return <View style={styles.container}>
    <View style={styles.heading}><View style={styles.icon}><Feather name="camera" size={22} color={colors.primary} /></View><View style={styles.copy}><Text style={styles.title}>Mostre seu trabalho</Text><Text style={styles.description}>{description}</Text></View></View>
    <FormField label="Legenda (opcional)" value={caption} onChangeText={setCaption} maxLength={200} editable={!publishing && !disabled} placeholder="Descreva o serviço mostrado na foto" />
    <AppButton label="Escolher e publicar foto" icon={<Feather name="plus" size={18} color={colors.white} />} loading={publishing} disabled={disabled} onPress={() => void publishPhoto()} />
    <Text style={styles.help}>A foto será publicada no seu perfil profissional.</Text>
  </View>;
}

const styles = StyleSheet.create({ container: { gap: 14 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft }, copy: { flex: 1, gap: 4 }, title: { color: colors.text, fontSize: 16, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 19 }, help: { color: colors.textMuted, fontSize: 12, lineHeight: 18 } });
