import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

export function StateView({ loading, message }: { loading?: boolean; message: string }) {
  return <View style={styles.container}>{loading && <ActivityIndicator color={colors.accent} />}<Text style={styles.text}>{message}</Text></View>;
}
const styles = StyleSheet.create({ container: { padding: 24, alignItems: 'center', gap: 12 }, text: { color: colors.textMuted, fontSize: 14, textAlign: 'center' } });
