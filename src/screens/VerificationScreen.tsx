import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { colors } from '../theme/colors';
import { uploadMedia } from '../utils/media-upload';
import { resolveEnumLabel, resolveStatusLabel } from '../utils/status';

const documentInstructions = {
  identity: 'Envie uma foto legível do seu documento com foto, como RG ou CNH. Deixe os dados e a foto visíveis.',
  address_proof: 'Envie uma foto legível de um comprovante de endereço, como uma conta de água ou energia.',
  professional_certificate: 'Envie uma foto legível de um certificado relacionado ao serviço que você oferece.'
};

interface VerificationDocument { id: string; type: string; status: string; reviewNotes?: string | null; createdAt: string; }

export function VerificationScreen() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [type, setType] = useState<'identity' | 'address_proof' | 'professional_certificate'>('identity');
  const [loading, setLoading] = useState(false);
  useEffect(() => { load(); }, []);

  function load() {
    apiRequest<VerificationDocument[]>('/verification/documents/me').then(setDocuments).catch(() => setDocuments([]));
  }

  async function submit() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso aos arquivos de imagem.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (result.canceled) return;
    setLoading(true);
    try {
      const asset = result.assets[0];
      const mediaId = await uploadMedia(asset.uri, asset.fileName || 'documento.jpg', asset.mimeType || 'image/jpeg', 'verification_document');
      await apiRequest('/verification/documents', { method: 'POST', body: JSON.stringify({ mediaId, type }) });
      Alert.alert('Documento enviado', 'A equipe analisará o documento em segurança.');
      load();
    } catch (error) {
      Alert.alert('Não foi possível enviar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return <Screen>
    <SectionHeader eyebrow="Confiança e segurança" title="Confirmar seus documentos" description="Escolha o tipo de documento e envie uma foto legível. Esses arquivos não aparecem no seu perfil público; nossa equipe fará a análise." />
    <ChoiceChips value={type} onChange={setType} options={[{ value: 'identity', label: 'Documento com foto' }, { value: 'address_proof', label: 'Comprovante de endereço' }, { value: 'professional_certificate', label: 'Certificado de curso' }]} />
    <Text style={styles.notes}>{documentInstructions[type]}</Text>
    <AppButton label="Escolher foto e enviar documento" onPress={submit} loading={loading} />
    {!documents.length && <StateView message="Nenhum documento enviado." />}
    {documents.map(document => <View key={document.id} style={styles.card}>
      <Text style={styles.title}>{resolveEnumLabel(document.type)}</Text>
      <Text style={styles.status}>{resolveStatusLabel(document.status)}</Text>
      {Boolean(document.reviewNotes) && <Text style={styles.notes}>{document.reviewNotes}</Text>}
    </View>)}
  </Screen>;
}

const styles = StyleSheet.create({ card: { gap: 6, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, title: { color: colors.text, fontWeight: '900' }, status: { color: colors.primary, fontWeight: '800' }, notes: { color: colors.textMuted } });
