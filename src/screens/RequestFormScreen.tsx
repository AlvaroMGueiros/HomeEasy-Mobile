import * as ImagePicker from 'expo-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Service, ServiceRequest, UserProfile } from '../types/api';
import { uploadMedia } from '../utils/media-upload';
import { parseOptionalNumber } from '../utils/number';

type SelectedImage = { uri: string; fileName: string; contentType: string };

export function RequestFormScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'RequestForm'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [service, setService] = useState<Service | null>(null);
  const [description, setDescription] = useState(''); const [urgency, setUrgency] = useState('flexible');
  const [address, setAddress] = useState(''); const [city, setCity] = useState(''); const [state, setState] = useState('');
  const [budgetMinimum, setBudgetMinimum] = useState(''); const [budgetMaximum, setBudgetMaximum] = useState(''); const [preferredDate, setPreferredDate] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({}); const [images, setImages] = useState<SelectedImage[]>([]); const [loading, setLoading] = useState(false);

  useEffect(() => { Promise.all([apiRequest<Service[]>('/services'), apiRequest<UserProfile>('/users/me')]).then(([services, profile]) => { setService(services.find(currentService => currentService.id === params.serviceId) || null); setAddress(profile.address || ''); setCity(profile.city || ''); setState(profile.state || ''); }); }, [params.serviceId]);

  async function selectImages() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permissão necessária', 'Permita o acesso às fotos para adicionar imagens.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 8, quality: 0.8 });
    if (!result.canceled) setImages(result.assets.slice(0, 8).map((asset, index) => ({ uri: asset.uri, fileName: asset.fileName || `solicitacao-${index + 1}.jpg`, contentType: asset.mimeType || 'image/jpeg' })));
  }

  async function submit() {
    if (description.trim().length < 20 || address.trim().length < 5 || city.trim().length < 2 || state.trim().length !== 2) { Alert.alert('Revise os dados', 'Descreva o serviço e informe endereço, cidade e UF.'); return; }
    setLoading(true);
    try {
      const request = await apiRequest<ServiceRequest>('/marketplace/requests', { method: 'POST', body: JSON.stringify({ serviceId: params.serviceId, preferredProfessionalId: params.professionalId, description: description.trim(), urgency, answers, address: address.trim(), city: city.trim(), state: state.trim().toUpperCase(), budgetMinimum: parseOptionalNumber(budgetMinimum), budgetMaximum: parseOptionalNumber(budgetMaximum), preferredAt: preferredDate ? `${preferredDate}T12:00:00-03:00` : undefined }) });
      for (const image of images) { const mediaId = await uploadMedia(image.uri, image.fileName, image.contentType, 'request_attachment'); await apiRequest(`/marketplace/requests/${request.id}/attachments/${mediaId}`, { method: 'POST' }); }
      Alert.alert('Solicitação enviada', params.professionalId ? 'O chamado foi direcionado ao profissional escolhido.' : 'Profissionais da região poderão enviar propostas.', [{ text: 'Ver solicitação', onPress: () => navigation.replace('RequestDetail', { requestId: request.id }) }]);
    } catch (error) { Alert.alert('Não foi possível enviar', error instanceof Error ? error.message : 'Revise os dados e tente novamente.'); } finally { setLoading(false); }
  }

  return <Screen><SectionHeader eyebrow={params.professionalId ? 'Solicitação direcionada' : 'Nova solicitação'} title={params.serviceName} description="Conte o que precisa, defina local, orçamento e preferência de atendimento." />
    <FormField label="Descrição detalhada" value={description} onChangeText={setDescription} multiline placeholder="Explique o problema, o ambiente e o resultado esperado." />
    <Text style={styles.label}>Urgência</Text><ChoiceChips value={urgency} onChange={setUrgency} options={[{ value: 'flexible', label: 'Flexível' }, { value: 'this_week', label: 'Esta semana' }, { value: 'urgent', label: 'Urgente' }]} />
    {service?.requestForm?.map(field => <FormField key={field.key} label={field.label} value={answers[field.key] || ''} onChangeText={value => setAnswers(current => ({ ...current, [field.key]: value }))} placeholder={field.required ? 'Obrigatório' : 'Opcional'} />)}
    <FormField label="Endereço" value={address} onChangeText={setAddress} /><FormField label="Cidade" value={city} onChangeText={setCity} /><FormField label="UF" value={state} onChangeText={value => setState(value.slice(0, 2).toUpperCase())} autoCapitalize="characters" />
    <View style={styles.row}><View style={styles.grow}><FormField label="Orçamento mínimo" value={budgetMinimum} onChangeText={setBudgetMinimum} keyboardType="decimal-pad" /></View><View style={styles.grow}><FormField label="Orçamento máximo" value={budgetMaximum} onChangeText={setBudgetMaximum} keyboardType="decimal-pad" /></View></View>
    <FormField label="Data preferida (AAAA-MM-DD)" value={preferredDate} onChangeText={setPreferredDate} keyboardType="numbers-and-punctuation" />
    <Pressable style={styles.photoButton} onPress={selectImages}><Text style={styles.photoLabel}>Adicionar fotos ({images.length}/8)</Text></Pressable><View style={styles.images}>{images.map(image => <Image key={image.uri} source={{ uri: image.uri }} style={styles.image} />)}</View>
    <AppButton label="Enviar solicitação" onPress={submit} loading={loading} />
  </Screen>;
}

const styles = StyleSheet.create({ label: { color: colors.text, fontWeight: '800' }, row: { flexDirection: 'row', gap: 10 }, grow: { flex: 1 }, photoButton: { minHeight: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface }, photoLabel: { color: colors.primary, fontWeight: '800' }, images: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, image: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.border } });
