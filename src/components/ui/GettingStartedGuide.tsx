import { StyleSheet, Text, View } from 'react-native';

import { GettingStartedGoal, gettingStartedGuides } from '../../config/gettingStarted';
import { colors } from '../../theme/colors';
import { ChoiceChips } from './ChoiceChips';

export function GettingStartedGuide({ goal, onChange }: { goal: GettingStartedGoal; onChange(goal: GettingStartedGoal): void }) {
  return <View style={styles.container}>
    <ChoiceChips value={goal} onChange={onChange} options={[{ value: GettingStartedGoal.FindProfessional, label: 'Quero contratar' }, { value: GettingStartedGoal.OfferServices, label: 'Quero trabalhar' }]} />
    <Text style={styles.help}>A mesma conta serve para contratar e oferecer serviços.</Text>
    {gettingStartedGuides[goal].steps.map((step, index) => <View key={step.title} style={styles.step}>
      <View style={styles.number}><Text style={styles.numberLabel}>{index + 1}</Text></View>
      <View style={styles.copy}><Text style={styles.title}>{step.title}</Text><Text style={styles.description}>{step.description}</Text></View>
    </View>)}
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: 16 }, help: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  step: { flexDirection: 'row', gap: 12 }, number: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  numberLabel: { color: colors.primary, fontWeight: '800' }, copy: { flex: 1, gap: 4 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 20 }
});
