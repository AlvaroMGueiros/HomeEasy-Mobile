import { AppIcon, type IconName } from './AppIcon';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText as Text } from './AppText';
import { colors } from '../../theme/colors';
import { AppButton } from './AppButton';

export function StateView({ loading, message, title, icon, actionLabel = 'Tentar novamente', onAction }: { loading?: boolean; message?: string; title?: string; icon?: IconName; actionLabel?: string; onAction?(): void }) {
  return <View style={styles.container} accessibilityLiveRegion="polite">{loading ? <ActivityIndicator color={colors.accent} /> : icon && <View style={styles.icon}><AppIcon name={icon} size={26} color={colors.primary} /></View>}{title && <Text style={styles.title}>{title}</Text>}{message && <Text style={styles.text}>{message}</Text>}{onAction && !loading && <AppButton label={actionLabel} onPress={onAction} variant="secondary" />}</View>;
}
const styles = StyleSheet.create({ container: { paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center', gap: 12 }, icon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, marginBottom: 4 }, title: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: '600', textAlign: 'center' }, text: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 320 } });
