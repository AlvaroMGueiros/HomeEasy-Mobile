import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { apiRequest } from '../api/api-client';
import { AppText } from '../components/ui/AppText';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ServiceIssue, serviceIssues } from '../config/serviceIssues';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { prepareServiceIssue } from '../utils/serviceIssue';

export function DisputeScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Dispute'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [issue, setIssue] = useState(params.issue || ServiceIssue.Quality);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (loading) return;
    let report;
    try { report = prepareServiceIssue(issue, description); }
    catch (failure) { Alert.alert('Revise o relato', (failure as Error).message); return; }
    setLoading(true);
    try {
      await apiRequest(`/orders/${params.orderId}/disputes`, { method: 'POST', body: JSON.stringify(report) });
      Alert.alert('Problema registrado', 'Acompanhe a análise no atendimento.', [{ text: 'Ver atendimento', onPress: () => navigation.navigate('OrderDetail', { orderId: params.orderId }) }]);
    } catch (failure) { Alert.alert('Problema não registrado', failure instanceof Error ? failure.message : 'Não foi possível enviar o relato deste atendimento.'); }
    finally { setLoading(false); }
  }

  return <Screen>
    <SectionHeader title="Ajuda com o atendimento" />
    <AppButton label="Ver histórico do atendimento" variant="secondary" disabled={loading} onPress={() => navigation.navigate('OrderDetail', { orderId: params.orderId })} />
    <AppText style={styles.label}>O que aconteceu?</AppText>
    <ChoiceChips value={issue} onChange={setIssue} options={serviceIssues} />
    <FormField required label="Conte os detalhes" placeholder="Informe o combinado e o que aconteceu." value={description} onChangeText={setDescription} multiline maxLength={2900} editable={!loading} />
    <AppText style={styles.note}>O relato fica vinculado a este serviço e abre uma análise. O outro participante também será avisado.</AppText>
    <AppButton label="Enviar para análise" onPress={() => void submit()} loading={loading} />
  </Screen>;
}

const styles = StyleSheet.create({ label: { color: colors.text, fontWeight: '800' }, note: { color: colors.textMuted, fontSize: 12, lineHeight: 19 } });
