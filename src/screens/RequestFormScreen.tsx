import * as ImagePicker from 'expo-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { ServiceRequestFields } from '../components/professional/ServiceRequestFields';
import { StatePickerField } from '../components/ui/StatePickerField';
import { StateView } from '../components/ui/StateView';
import { formCopy } from '../config/formCopy';
import { prepareServiceAnswers } from '../utils/serviceRequestForm';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { DatePickerField } from '../components/ui/DatePickerField';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { TimePickerField } from '../components/ui/TimePickerField';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Service, ServiceRequest, UserProfile } from '../types/api';
import { uploadMedia } from '../utils/media-upload';
import { parseOptionalNumber } from '../utils/number';
import { resolvePreferredAppointment } from '../utils/date';

type SelectedImage = { uri: string; fileName: string; contentType: string };

export function RequestFormScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'RequestForm'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [service, setService] = useState<Service | null>(null);
  const [description, setDescription] = useState(''); const [urgency, setUrgency] = useState('flexible');
  const [address, setAddress] = useState(''); const [city, setCity] = useState(''); const [state, setState] = useState('');
  const [budgetMinimum, setBudgetMinimum] = useState(''); const [budgetMaximum, setBudgetMaximum] = useState(''); const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({}); const [images, setImages] = useState<SelectedImage[]>([]); const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [loadingForm, setLoadingForm] = useState(true);
  const minimumPreferredDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingForm(true); setFormError('');
    Promise.all([apiRequest<Service[]>('/services'), apiRequest<UserProfile>('/users/me')])
      .then(([services, profile]) => {
        if (!active) return;
        const selectedService = services.find(currentService => currentService.id === params.serviceId);
        if (!selectedService) throw new Error('Este serviço não está disponível. Volte e escolha outro serviço.');
        setService(selectedService); setAnswers({}); setAddress(profile.address || ''); setCity(profile.city || ''); setState(profile.state || '');
      })
      .catch(failure => { if (active) setFormError(failure instanceof Error ? failure.message : 'Não foi possível carregar as perguntas deste serviço. Volte e tente novamente.'); })
      .finally(() => { if (active) setLoadingForm(false); });
    return () => { active = false; };
  }, [params.serviceId]);

  async function selectImages() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permissão necessária', 'Permita o acesso às fotos para adicionar imagens.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 8, quality: 0.8 });
    if (!result.canceled) setImages(result.assets.slice(0, 8).map((asset, index) => ({ uri: asset.uri, fileName: asset.fileName || `solicitacao-${index + 1}.jpg`, contentType: asset.mimeType || 'image/jpeg' })));
  }

  async function submit() {
    if (loading || loadingForm || formError) return;
    if (description.trim().length < 20) { Alert.alert('Conte um pouco mais', 'Explique o que precisa ser feito usando pelo menos 20 caracteres.'); return; }
    if (address.trim().length < 5) { Alert.alert('Onde será o serviço?', 'Informe a rua, o número e o bairro do atendimento.'); return; }
    if (city.trim().length < 2 || !state) { Alert.alert('Complete o local do serviço', 'Informe a cidade e selecione o estado.'); return; }
    let serviceAnswers: Record<string, string | number>;
    try { serviceAnswers = prepareServiceAnswers(service?.requestForm || [], answers); }
    catch (failure) { Alert.alert('Revise as perguntas do serviço', failure instanceof Error ? failure.message : 'Responda às perguntas obrigatórias do serviço.'); return; }
    const minimumBudget = parseOptionalNumber(budgetMinimum);
    const maximumBudget = parseOptionalNumber(budgetMaximum);
    if ((budgetMinimum.trim() && (minimumBudget === undefined || minimumBudget < 0)) || (budgetMaximum.trim() && (maximumBudget === undefined || maximumBudget < 0))) { Alert.alert('Revise os valores', 'Use valores em reais, como 150,00. Você também pode deixar os valores em branco.'); return; }
    if (minimumBudget !== undefined && maximumBudget !== undefined && minimumBudget > maximumBudget) { Alert.alert('Revise os valores', 'O valor máximo precisa ser igual ou maior que o valor mínimo.'); return; }
    let preferredAt: string | undefined;
    try { preferredAt = resolvePreferredAppointment(preferredDate, preferredTime); }
    catch (failure) { Alert.alert('Revise o horário', failure instanceof Error ? failure.message : 'Escolha uma data e um horário futuros.'); return; }
    setLoading(true);
    try {
      const request = await apiRequest<ServiceRequest>('/marketplace/requests', { method: 'POST', body: JSON.stringify({ serviceId: params.serviceId, preferredProfessionalId: params.professionalId, description: description.trim(), urgency, answers: serviceAnswers, address: address.trim(), city: city.trim(), state: state.trim().toUpperCase(), budgetMinimum: minimumBudget, budgetMaximum: maximumBudget, preferredAt }) });
      for (const image of images) { const mediaId = await uploadMedia(image.uri, image.fileName, image.contentType, 'request_attachment'); await apiRequest(`/marketplace/requests/${request.id}/attachments/${mediaId}`, { method: 'POST' }); }
      Alert.alert('Pedido de orçamento enviado', params.professionalId ? 'Seu pedido de orçamento foi enviado ao profissional que você escolheu.' : 'Profissionais da região poderão enviar propostas.', [{ text: 'Acompanhar pedido de orçamento', onPress: () => navigation.replace('RequestDetail', { requestId: request.id }) }]);
    } catch (error) { Alert.alert('Não foi possível enviar', error instanceof Error ? error.message : 'Revise os dados e tente novamente.'); } finally { setLoading(false); }
  }

  return <Screen><SectionHeader eyebrow={params.professionalId ? 'Pedir orçamento a este profissional' : 'Pedir orçamentos'} title={params.serviceName} description="Conte o que precisa ser feito e onde será o serviço. Enviar este pedido ainda não confirma uma contratação." />
    {formError && <StateView title="Perguntas indisponíveis" message={formError} />}
    {loadingForm && <StateView loading message="Carregando as perguntas do serviço..." />}
    <FormField required label="O que você precisa que seja feito?" value={description} onChangeText={setDescription} multiline placeholder="Explique o problema, o ambiente e o resultado esperado." />
    <Text style={styles.descriptionHelp}>Escreva pelo menos 20 caracteres para ajudar o profissional a entender o serviço. ({description.trim().length}/20)</Text>
    <Text style={styles.label}>Quando você precisa do serviço?</Text><ChoiceChips value={urgency} onChange={setUrgency} options={[{ value: 'flexible', label: 'Posso combinar a data' }, { value: 'this_week', label: 'Esta semana' }, { value: 'urgent', label: 'O quanto antes' }]} />
    <ServiceRequestFields fields={service?.requestForm || []} answers={answers} onChange={(key, value) => setAnswers(current => ({ ...current, [key]: value }))} />
    <FormField {...formCopy.address} required value={address} onChangeText={setAddress} />
    <FormField {...formCopy.city} required value={city} onChangeText={setCity} />
    <StatePickerField value={state} onChange={setState} required />
    <Text style={styles.label}>Quanto você pretende gastar?</Text>
    <Text style={styles.descriptionHelp}>Os dois valores são opcionais. Se não souber, deixe em branco e compare os orçamentos recebidos.</Text>
    <FormField label="A partir de quanto? (R$, opcional)" placeholder="Ex.: 100,00" value={budgetMinimum} onChangeText={setBudgetMinimum} keyboardType="decimal-pad" />
    <FormField label="Até quanto? (R$, opcional)" placeholder="Ex.: 300,00" value={budgetMaximum} onChangeText={setBudgetMaximum} keyboardType="decimal-pad" />
    <DatePickerField clearable label="Dia de preferência (opcional)" value={preferredDate} onChange={setPreferredDate} minimumDate={minimumPreferredDate} />
    {Boolean(preferredDate) && <TimePickerField label="Horário de sua preferência" value={preferredTime} onChange={setPreferredTime} />}
    <Text style={styles.descriptionHelp}>Pode ser hoje, desde que o horário ainda não tenha passado. Sem data, combine o atendimento pela conversa.</Text>
    <Pressable style={styles.photoButton} onPress={selectImages}><Text style={styles.photoLabel}>Adicionar fotos ({images.length}/8)</Text></Pressable><View style={styles.images}>{images.map(image => <Image key={image.uri} source={{ uri: image.uri }} style={styles.image} />)}</View>
    <AppButton label="Pedir orçamento" onPress={submit} loading={loading} disabled={loadingForm || Boolean(formError)} />
  </Screen>;
}

const styles = StyleSheet.create({ label: { color: colors.text, fontWeight: '800' }, descriptionHelp: { color: colors.textMuted, fontSize: 12, lineHeight: 17 }, row: { flexDirection: 'row', gap: 10 }, grow: { flex: 1 }, photoButton: { minHeight: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface }, photoLabel: { color: colors.primary, fontWeight: '800' }, images: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, image: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.border } });
