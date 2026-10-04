import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Professional, Schedule } from '../../types/api';
import { formatDate } from '../../utils/date';
import { resolveProfessionalSchedule } from '../../utils/professional-profile';

export function ProfessionalProfileAbout({ professional, priceLabel, coverage, schedule }: { professional: Professional; priceLabel: string; coverage: string; schedule: Schedule | null }) {
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const periods = resolveProfessionalSchedule(schedule);
  return <View style={styles.container}>
    <Text style={styles.bio}>{professional.bio?.trim() || 'Conheça os serviços oferecidos e solicite um orçamento para combinar os detalhes do atendimento.'}</Text>
    <View style={styles.facts}>
      <View style={styles.fact}><Feather name="credit-card" size={17} color={colors.primary} /><Text style={styles.factText}>{priceLabel}</Text></View>
      <View style={styles.fact}><Feather name="map-pin" size={17} color={colors.primary} /><Text style={styles.factText}>{coverage}</Text></View>
      <View style={styles.fact}><Feather name="calendar" size={17} color={colors.primary} /><Text style={styles.factText}>{professional.isAvailable === false ? 'Consulte a disponibilidade no orçamento' : 'Combine a data e o horário na solicitação'}</Text></View>
      {Boolean(professional.yearsOfExperience && professional.yearsOfExperience > 0) && <View style={styles.fact}><Feather name="briefcase" size={17} color={colors.primary} /><Text style={styles.factText}>{professional.yearsOfExperience} {professional.yearsOfExperience === 1 ? 'ano' : 'anos'} de experiência</Text></View>}
    </View>
    {Boolean(professional.metrics?.completedServices && professional.metrics.completedServices > 0) && <View style={styles.history}><Feather name="check-circle" size={18} color={colors.success} /><Text style={styles.historyText}>{professional.metrics?.completedServices} serviços concluídos na Home Easy</Text></View>}
    {periods.length > 0 && <View style={styles.schedule}><Pressable accessibilityRole="button" accessibilityState={{ expanded: scheduleExpanded }} onPress={() => setScheduleExpanded(current => !current)} style={styles.scheduleHeader}><Text style={styles.heading}>Horários de atendimento</Text><Feather name={scheduleExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} /></Pressable>{scheduleExpanded && <>{periods.map(period => <View key={period.key} style={styles.period}><Text style={styles.day}>{period.day}</Text><Text style={styles.hours}>{period.hours}</Text></View>)}<Text style={styles.help}>Horários informados pelo profissional. A data do serviço é confirmada na contratação.</Text></>}
    </View>}
    {professional.memberSince && <Text style={styles.member}>Na Home Easy desde {formatDate(professional.memberSince)}</Text>}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: 16 }, bio: { color: colors.text, fontSize: 14, lineHeight: 22 }, facts: { gap: 13 }, fact: { flexDirection: 'row', alignItems: 'center', gap: 10 }, factText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 }, history: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, borderRadius: 14, backgroundColor: colors.successSoft }, historyText: { flex: 1, color: colors.success, fontSize: 12, fontWeight: '700', lineHeight: 18 }, schedule: { gap: 10, padding: 15, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, scheduleHeader: { minHeight: 36, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }, heading: { color: colors.text, fontSize: 15, fontWeight: '800' }, period: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, day: { flex: 1, color: colors.text, fontSize: 13 }, hours: { color: colors.textMuted, fontSize: 13 }, help: { color: colors.textMuted, fontSize: 11, lineHeight: 17 }, member: { color: colors.textMuted, fontSize: 11 } });
