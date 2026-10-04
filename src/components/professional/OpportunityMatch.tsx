import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

interface OpportunityMatchProps {
  score?: number;
  reasons?: string[];
}

export function OpportunityMatch({ score, reasons = [] }: OpportunityMatchProps) {
  if (score === undefined) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.score}>{score}% compatível</Text>
      {reasons.length > 0 && <Text style={styles.reasons}>{reasons.join(' · ')}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 3 },
  score: { color: colors.success, fontSize: 13, fontWeight: '900' },
  reasons: { color: colors.textMuted, fontSize: 12, lineHeight: 17 }
});
