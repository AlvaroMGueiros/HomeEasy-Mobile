import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { AppText as Text } from '../components/ui/AppText';
import { apiRequest } from '../api/api-client';
import { AppButton } from '../components/ui/AppButton';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { FormField } from '../components/ui/FormField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { ReportCategory } from '../types/api';

export function ReportScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Report'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [category, setCategory] = useState(ReportCategory.Other);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (loading) return;
    if (description.trim().length < 20) { Alert.alert('Detalhe a denúncia', 'Escreva pelo menos 20 caracteres.'); return; }
    setLoading(true);
    try {
      await apiRequest('/reports', { method: 'POST', body: JSON.stringify({ ...params, category, description: description.trim() }) });
      Alert.alert('Denúncia enviada', 'Nossa equipe vai analisar seu relato.', [{ text: 'Concluir', onPress: () => navigation.goBack() }]);
    } catch (failure) {
      Alert.alert('Não foi possível denunciar', failure instanceof Error ? failure.message : 'Confira sua conexão e tente novamente.');
    } finally { setLoading(false); }
  }

  return <Screen>
    <SectionHeader eyebrow="Segurança" title="Fazer denúncia" />
    {params.highlightId && <Text style={styles.help}>Esta denúncia está vinculada à publicação selecionada.</Text>}
    {params.messageId && <Text style={styles.help}>Mensagem selecionada para análise.</Text>}
    <Text style={styles.label}>Motivo</Text>
    <ChoiceChips value={category} onChange={setCategory} options={[
      { value: ReportCategory.Fraud, label: 'Golpe ou tentativa de golpe' },
      { value: ReportCategory.Harassment, label: 'Assédio' },
      { value: ReportCategory.InappropriateContent, label: 'Conteúdo impróprio' },
      { value: ReportCategory.Other, label: 'Outro' }
    ]} />
    <FormField required label="O que aconteceu?" placeholder="Conte o que a pessoa fez e, se possível, quando aconteceu." hint="De 20 a 2.000 caracteres." value={description} onChangeText={setDescription} multiline maxLength={2000} editable={!loading} />
    <AppButton label="Enviar denúncia" onPress={() => void submit()} loading={loading} />
    <AppButton label="Ler regras de uso e moderação" variant="secondary" onPress={() => navigation.navigate('CommunityRules')} />
  </Screen>;
}

const styles = StyleSheet.create({ label: { color: colors.text, fontWeight: '800' }, help: { color: colors.textMuted, fontSize: 13, lineHeight: 20 } });
