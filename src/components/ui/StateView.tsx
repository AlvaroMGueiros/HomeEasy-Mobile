import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { AppButton } from './AppButton';

export function StateView({ loading, message, title, icon, actionLabel = 'Tentar novamente', onAction }: { loading?: boolean; message: string; title?: string; icon?: keyof typeof Feather.glyphMap; actionLabel?: string; onAction?(): void }) {
  return <View style={styles.container} accessibilityLiveRegion="polite">{loading ? <ActivityIndicator color={colors.accent} /> : icon && <View style={styles.icon}><Feather name={icon} size={26} color={colors.primary} /></View>}{title && <Text style={styles.title}>{title}</Text>}<Text style={styles.text}>{message}</Text>{onAction && !loading && <AppButton label={actionLabel} onPress={onAction} variant="secondary" />}</View>;
}
const styles = StyleSheet.create({ container: { padding: 24, alignItems: 'center', gap: 12 }, icon: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }, title: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' }, text: { color: colors.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center' } });
