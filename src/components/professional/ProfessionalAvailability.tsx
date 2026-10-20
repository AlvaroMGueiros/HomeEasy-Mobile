import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { apiRequest } from '../../api/api-client';
import { colors } from '../../theme/colors';
import { Availability } from '../../types/api';
import { resolveAvailabilityQuery } from '../../utils/professionalAvailability';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { DatePickerField } from '../ui/DatePickerField';
import { TimePickerField } from '../ui/TimePickerField';

export function ProfessionalAvailability({ professionalId }: { professionalId: string }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);
  const queryVersion = useRef(0);
  useEffect(() => { queryVersion.current += 1; setResult(null); setLoading(false); }, [date, time, professionalId]);
  useEffect(() => () => { queryVersion.current += 1; }, []);

  async function consult() {
    if (loading) return;
    let query: string;
    try { query = resolveAvailabilityQuery(date, time); }
    catch (failure) { Alert.alert('Escolha o horário', (failure as Error).message); return; }
    const version = ++queryVersion.current;
    setLoading(true); setResult(null);
    try {
      const availability = await apiRequest<Availability>(`/schedules/${professionalId}/availability?${query}`);
      if (version === queryVersion.current) setResult(availability);
    } catch (failure) {
      if (version === queryVersion.current) Alert.alert('Agenda indisponível', failure instanceof Error ? failure.message : 'Não foi possível consultar este horário.');
    } finally { if (version === queryVersion.current) setLoading(false); }
  }

  return <View style={styles.card}>
    <AppText style={styles.title}>Consultar um horário</AppText>
    <DatePickerField label="Data" value={date} onChange={setDate} minimumDate={new Date()} />
    <TimePickerField label="Horário de Brasília" value={time} onChange={setTime} />
    <AppButton label="Consultar disponibilidade" variant="secondary" loading={loading} onPress={() => void consult()} />
    {result && <AppText style={styles.result}>{result.isAvailable ? 'Livre na agenda para um serviço de até 1 hora. Confirme na proposta.' : 'Sem horário cadastrado ou com outro atendimento nesse período.'}</AppText>}
  </View>;
}

const styles = StyleSheet.create({ card: { padding: 16, gap: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, title: { color: colors.text, fontWeight: '800', fontSize: 17 }, result: { color: colors.primary, lineHeight: 21 } });
