import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText as Text } from '../components/ui/AppText';
import { apiRequest } from '../api/api-client';
import { ServiceRequestFields } from '../components/professional/ServiceRequestFields';
import { StatePickerField } from '../components/ui/StatePickerField';
import { StateView } from '../components/ui/StateView';
import { formCopy } from '../config/formCopy';
import { RequestStep, prepareRequestAppointment, prepareRequestDetails } from '../utils/requestDraft';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { DatePickerField } from '../components/ui/DatePickerField';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { TimePickerField } from '../components/ui/TimePickerField';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { OrderDetail, Service, ServiceRequest, UserProfile } from '../types/api';
import { uploadMedia } from '../utils/media-upload';
import { choosePhotos } from '../utils/photo-picker';

import { formatAppointment } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { resolveServiceAnswerDetails } from '../utils/serviceRequestForm';
import { resolveEnumLabel } from '../utils/status';

const requestStepLabels = { [RequestStep.Details]: '1 de 3 · Serviço e fotos', [RequestStep.Appointment]: '2 de 3 · Local e data', [RequestStep.Review]: '3 de 3 · Revisar pedido' };

type SelectedImage = { uri: string; fileName: string; contentType: string };

export function RequestFormScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'RequestForm'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = useState(RequestStep.Details);
  const [reviewAppointment, setReviewAppointment] = useState<ReturnType<typeof prepareRequestAppointment> | null>(null);
  const sending = useRef(false);
  const createdRequest = useRef<ServiceRequest | null>(null);
  const attachedImageCount = useRef(0);
  const uploadedMediaIds = useRef<string[]>([]);
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
    setLoadingForm(true); setFormError(''); setStep(RequestStep.Details); setDescription(''); setImages([]); setUrgency('flexible'); setPreferredDate(''); setPreferredTime(''); setBudgetMinimum(''); setBudgetMaximum(''); setReviewAppointment(null);
    createdRequest.current = null; attachedImageCount.current = 0; uploadedMediaIds.current = [];
    Promise.all([apiRequest<Service[]>('/services'), apiRequest<UserProfile>('/users/me'), params.sourceOrderId ? apiRequest<OrderDetail>(`/marketplace/orders/${params.sourceOrderId}`) : Promise.resolve(null)])
      .then(([services, profile, previousOrder]) => {
        if (!active) return;
        const selectedService = services.find(currentService => currentService.id === params.serviceId);
        if (!selectedService) throw new Error('Este serviço não está disponível. Volte e escolha outro serviço.');
        setService(selectedService); setAnswers({}); setAddress(profile.address || ''); setCity(profile.city || ''); setState(profile.state || '');
        if (previousOrder) {
          if (previousOrder.clientId !== profile.id || previousOrder.request.serviceId !== params.serviceId || previousOrder.professionalId !== params.professionalId) throw new Error('Este atendimento não pode ser reutilizado para este pedido.');
          setDescription(previousOrder.request.description);
          setAddress(previousOrder.request.address || profile.address || '');
          setCity(previousOrder.request.city); setState(previousOrder.request.state);
          const previousAnswers: Record<string, string> = {};
          for (const field of selectedService.requestForm || []) {
            const answer = previousOrder.request.answers?.[field.key];
            if (typeof answer === 'string' || typeof answer === 'number') previousAnswers[field.key] = String(answer);
          }
          setAnswers(previousAnswers);
        }
      })
      .catch(failure => { if (active) setFormError(failure instanceof Error ? failure.message : 'Não foi possível carregar as perguntas deste serviço. Volte e tente novamente.'); })
      .finally(() => { if (active) setLoadingForm(false); });
    return () => { active = false; };
  }, [params.serviceId, params.sourceOrderId, params.professionalId]);

  async function selectImages() {
    const result = await choosePhotos({ allowsMultipleSelection: true, selectionLimit: 8, quality: 0.8 });
    if (!result.canceled) setImages(result.assets.slice(0, 8).map((asset, index) => ({ uri: asset.uri, fileName: asset.fileName || `solicitacao-${index + 1}.jpg`, contentType: asset.mimeType || 'image/jpeg' })));
  }

  const draft = { description, answers, address, city, state, budgetMinimum, budgetMaximum, preferredDate, preferredTime };
  function nextStep() {
    try {
      if (step === RequestStep.Details) { prepareRequestDetails(draft, service?.requestForm || []); setStep(RequestStep.Appointment); }
      else { setReviewAppointment(prepareRequestAppointment(draft)); setStep(RequestStep.Review); }
    } catch (failure) { Alert.alert('Revise esta etapa', (failure as Error).message); }
  }

  async function submit() {
    if (sending.current || loading || loadingForm || formError) return;
    let preparedRequest;
    try { if (!createdRequest.current) preparedRequest = { ...prepareRequestDetails(draft, service?.requestForm || []), ...prepareRequestAppointment(draft) }; }
    catch (failure) { Alert.alert('Revise o pedido', (failure as Error).message); return; }
    sending.current = true; setLoading(true);
    try {
      const request = createdRequest.current || await apiRequest<ServiceRequest>('/marketplace/requests', { method: 'POST', body: JSON.stringify({ serviceId: params.serviceId, preferredProfessionalId: params.professionalId, urgency, ...preparedRequest }) });
      createdRequest.current = request;
      for (let imageIndex = attachedImageCount.current; imageIndex < images.length; imageIndex += 1) {
        const image = images[imageIndex];
        const mediaId = uploadedMediaIds.current[imageIndex] || await uploadMedia(image.uri, image.fileName, image.contentType, 'request_attachment');
        uploadedMediaIds.current[imageIndex] = mediaId;
        await apiRequest(`/marketplace/requests/${request.id}/attachments/${mediaId}`, { method: 'POST' });
        attachedImageCount.current = imageIndex + 1;
      }
      Alert.alert('Pedido de orçamento enviado', params.professionalId ? 'Seu pedido de orçamento foi enviado ao profissional que você escolheu.' : 'Profissionais da região poderão enviar propostas.', [{ text: 'Acompanhar pedido de orçamento', onPress: () => navigation.replace('RequestDetail', { requestId: request.id }) }]);
    } catch (error) { Alert.alert(createdRequest.current ? 'Pedido criado, mas faltam fotos' : 'Não foi possível enviar', error instanceof Error ? error.message : 'Revise os dados e tente novamente.'); } finally { sending.current = false; setLoading(false); }
  }

  return <Screen><SectionHeader eyebrow={params.professionalId ? 'Pedir orçamento a este profissional' : 'Pedir orçamentos'} title={params.serviceName} description="Enviar o pedido não confirma a contratação." />
    {formError && <StateView title="Perguntas indisponíveis" message={formError} />}
    {loadingForm && <StateView loading message="Carregando as perguntas do serviço..." />}
    <Text style={styles.label}>{requestStepLabels[step]}</Text>
    {step === RequestStep.Details && <>
    <FormField required label="O que você precisa que seja feito?" value={description} onChangeText={setDescription} multiline placeholder="Explique o problema, o ambiente e o resultado esperado." />
    <Text style={styles.descriptionHelp}>Mínimo de 20 caracteres · {description.trim().length}/20</Text>
    <Text style={styles.label}>Quando você precisa do serviço?</Text><ChoiceChips value={urgency} onChange={setUrgency} options={[{ value: 'flexible', label: 'Posso combinar a data' }, { value: 'this_week', label: 'Esta semana' }, { value: 'urgent', label: 'O quanto antes' }]} />
    <ServiceRequestFields fields={service?.requestForm || []} answers={answers} onChange={(key, value) => setAnswers(current => ({ ...current, [key]: value }))} />
    <Pressable style={styles.photoButton} onPress={selectImages}><Text style={styles.photoLabel}>Adicionar fotos ({images.length}/8)</Text></Pressable><View style={styles.images}>{images.map(image => <Image key={image.uri} source={{ uri: image.uri }} style={styles.image} />)}</View>
    </>}
    {step === RequestStep.Appointment && <>
    <FormField {...formCopy.address} required value={address} onChangeText={setAddress} />
    <FormField {...formCopy.city} required value={city} onChangeText={setCity} />
    <StatePickerField value={state} onChange={setState} required />
    <Text style={styles.label}>Quanto você pretende gastar?</Text>
    <FormField label="A partir de quanto? (R$, opcional)" placeholder="Ex.: 100,00" value={budgetMinimum} onChangeText={setBudgetMinimum} keyboardType="decimal-pad" />
    <FormField label="Até quanto? (R$, opcional)" placeholder="Ex.: 300,00" value={budgetMaximum} onChangeText={setBudgetMaximum} keyboardType="decimal-pad" />
    <DatePickerField clearable label="Dia de preferência (opcional)" value={preferredDate} onChange={setPreferredDate} minimumDate={minimumPreferredDate} />
    {Boolean(preferredDate) && <TimePickerField label="Horário de sua preferência" value={preferredTime} onChange={setPreferredTime} />}

    </>}
    {step === RequestStep.Review && <View style={styles.review}>
      <Text style={styles.label}>{service?.name}</Text><Text>{description}</Text>
      <Text>{address}, {city}, {state}</Text>
      <Text>{resolveEnumLabel(urgency)}</Text>
      <Text>{formatAppointment(reviewAppointment?.preferredAt)}</Text>
      {resolveServiceAnswerDetails(answers, service?.requestForm).filter(answer => answer.value.trim()).map(answer => <Text key={answer.key}>{answer.label}: {answer.value}</Text>)}
      {Boolean(budgetMinimum) && <Text>A partir de {formatCurrency(Number(reviewAppointment?.budgetMinimum))}</Text>}
      {Boolean(budgetMaximum) && <Text>Até {formatCurrency(Number(reviewAppointment?.budgetMaximum))}</Text>}
      <Text>{images.length} fotos · {params.professionalId ? 'Pedido direcionado ao profissional escolhido' : 'Profissionais da região'}</Text>
    </View>}
    {step !== RequestStep.Details && <AppButton label="Voltar" variant="secondary" disabled={loading || Boolean(createdRequest.current)} onPress={() => setStep(step === RequestStep.Review ? RequestStep.Appointment : RequestStep.Details)} />}
    {step === RequestStep.Review ? <AppButton label={createdRequest.current ? 'Tentar concluir envio das fotos' : 'Enviar pedido de orçamento'} onPress={submit} loading={loading} disabled={loadingForm || Boolean(formError)} /> : <AppButton label="Continuar" onPress={nextStep} disabled={loadingForm || Boolean(formError)} />}
  </Screen>;
}

const styles = StyleSheet.create({ review: { padding: 16, gap: 12, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, label: { color: colors.text, fontWeight: '800' }, descriptionHelp: { color: colors.textMuted, fontSize: 12, lineHeight: 17 }, row: { flexDirection: 'row', gap: 10 }, grow: { flex: 1 }, photoButton: { minHeight: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface }, photoLabel: { color: colors.primary, fontWeight: '800' }, images: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, image: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.border } });
