import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme/colors';

export function AppButton({ label, onPress, loading = false, disabled = false, variant = 'primary', icon }: { label: string; onPress(): void; loading?: boolean; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger'; icon?: ReactNode; }) {
  const isDisabled = disabled || loading;
  const indicatorColor = variant === 'secondary' ? colors.primary : colors.white;
  return <Pressable accessibilityRole="button" disabled={isDisabled} onPress={onPress} style={({ pressed }) => [styles.button, variant === 'secondary' && styles.secondary, variant === 'danger' && styles.danger, isDisabled && styles.disabled, pressed && styles.pressed]}>
    {loading ? <ActivityIndicator color={indicatorColor} /> : <>{icon}<Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{label}</Text></>}
  </Pressable>;
}

const styles = StyleSheet.create({ button: { minHeight: 52, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 20 }, secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, danger: { backgroundColor: colors.danger }, label: { color: colors.white, fontSize: 16, fontWeight: '700' }, secondaryLabel: { color: colors.primary }, disabled: { opacity: 0.5 }, pressed: { opacity: 0.82 } });
