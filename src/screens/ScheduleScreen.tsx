import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { ProfessionalScheduleDay } from '../components/professional/ProfessionalScheduleDay';
import { AppButton } from '../components/ui/AppButton';
import { DatePickerField } from '../components/ui/DatePickerField';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { colors } from '../theme/colors';
import { Schedule } from '../types/api';
import { formatIsoDateForDisplay } from '../utils/date';
import { normalizeProfessionalSchedule, professionalWeekdays, validateProfessionalSchedule } from '../utils/professionalSchedule';

export function ScheduleScreen() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [blockedDate, setBlockedDate] = useState('');

  async function loadSchedule() {
    setLoading(true); setError('');
    try {
      const savedSchedule = await apiRequest<Schedule>('/schedules/me');
      setSchedule(normalizeProfessionalSchedule(savedSchedule));
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível consultar sua disponibilidade.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadSchedule(); }, []);

  function updateDay(weekday: number, periods: Schedule['periods']) {
    setSchedule(current => current ? { ...current, periods: [...current.periods.filter(period => period.weekday !== weekday), ...periods] } : current);
  }

  function applyBusinessHours() {
    Alert.alert('Aplicar horário comercial?', 'Os horários da semana serão substituídos por segunda a sexta, das 08:00 às 18:00. Os bloqueios de datas serão mantidos.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Aplicar', onPress: () => setSchedule(current => current ? { ...current, periods: [1, 2, 3, 4, 5].map(weekday => ({ weekday, startTime: '08:00', endTime: '18:00' })) } : current) }]);
  }

  function blockDate() {
    if (!blockedDate || !schedule) return;
    if (schedule.exceptions.some(exception => exception.date.slice(0, 10) === blockedDate)) { Alert.alert('Data já configurada', 'Remova a exceção existente antes de bloquear esta data.'); return; }
    if (schedule.exceptions.length >= 120) { Alert.alert('Limite de datas', 'Remova uma exceção para adicionar outra. O limite é de 120 datas.'); return; }
    setSchedule({ ...schedule, exceptions: [...schedule.exceptions, { date: blockedDate, isUnavailable: true }] });
    setBlockedDate('');
  }

  async function saveSchedule() {
    if (!schedule || saving) return;
    const validationError = validateProfessionalSchedule(schedule);
    if (validationError) { Alert.alert('Revise os horários', validationError); return; }
    setSaving(true);
    try {
      await apiRequest('/schedules/me', { method: 'PUT', body: JSON.stringify(normalizeProfessionalSchedule(schedule)) });
      Alert.alert('Agenda atualizada', 'Seus horários e bloqueios de datas foram salvos.');
    } catch (failure) { Alert.alert('Agenda não salva', failure instanceof Error ? failure.message : 'Não foi possível salvar seus horários e bloqueios.'); }
    finally { setSaving(false); }
  }

  if (!schedule) return <Screen><StateView loading={loading} title="Agenda indisponível" message={error || 'Carregando disponibilidade...'} onAction={error ? loadSchedule : undefined} /></Screen>;
  const availableDays = new Set(schedule.periods.map(period => period.weekday)).size;
  return <Screen>
    <SectionHeader eyebrow="Disponibilidade" title="Sua semana de trabalho" description="Ative os dias em que atende e ajuste os horários de cada um. Use mais de um intervalo para reservar a pausa do almoço." />
    <View style={styles.summary}><Text style={styles.heading}>{availableDays} dias disponíveis por semana</Text><Text style={styles.help}>Dias desligados são folgas. As mudanças só entram em vigor ao salvar.</Text></View>
    <AppButton label="Usar segunda a sexta · 08h às 18h" variant="secondary" disabled={saving} onPress={applyBusinessHours} />
    {professionalWeekdays.map((label, weekday) => <ProfessionalScheduleDay key={weekday} label={label} weekday={weekday} periods={schedule.periods.filter(period => period.weekday === weekday)} disabled={saving} onChange={periods => updateDay(weekday, periods)} />)}
    <Text style={styles.heading}>Folgas e datas especiais</Text>
    <Text style={styles.help}>Bloqueie um dia inteiro para férias ou compromissos. Os horários especiais já cadastrados são preservados.</Text>
    {!saving && <DatePickerField label="Dia sem atendimento" value={blockedDate} onChange={setBlockedDate} minimumDate={new Date()} />}
    <AppButton label="Bloquear esta data" variant="secondary" disabled={!blockedDate || saving} onPress={blockDate} />
    {schedule.exceptions.map(exception => <View key={exception.date} style={styles.summary}><Text style={styles.heading}>{formatIsoDateForDisplay(exception.date.slice(0, 10))}</Text><Text style={styles.help}>{exception.isUnavailable ? 'Sem atendimento' : `${exception.startTime?.slice(0, 5)} às ${exception.endTime?.slice(0, 5)}`}</Text><AppButton label="Remover exceção" variant="secondary" disabled={saving} onPress={() => setSchedule(current => current ? { ...current, exceptions: current.exceptions.filter(currentException => currentException.date !== exception.date) } : current)} /></View>)}
    <AppButton label="Salvar disponibilidade" loading={saving} onPress={() => { if (!schedule.periods.length) Alert.alert('Salvar sem horários?', 'Seu perfil ficará sem horários semanais de atendimento.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Salvar', onPress: () => void saveSchedule() }]); else void saveSchedule(); }} />
  </Screen>;
}

const styles = StyleSheet.create({ summary: { padding: 16, borderRadius: 18, gap: 10, backgroundColor: colors.primarySoft }, heading: { color: colors.text, fontSize: 17, fontWeight: '800' }, help: { color: colors.textMuted, fontSize: 13, lineHeight: 20 } });
