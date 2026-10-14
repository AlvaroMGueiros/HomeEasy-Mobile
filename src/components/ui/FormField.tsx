import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../../theme/colors';

export function FormField({ label, hint, required, multiline, ...inputProps }: TextInputProps & { label: string; hint?: string; required?: boolean }) {
  const accessibleLabel = required ? `${label} (obrigatório)` : label;
  return <View style={styles.field}><Text style={styles.label}>{accessibleLabel}</Text><TextInput {...inputProps} accessibilityLabel={inputProps.accessibilityLabel || accessibleLabel} accessibilityHint={inputProps.accessibilityHint || hint} multiline={multiline} placeholderTextColor={colors.textMuted} style={[styles.input, multiline && styles.multiline]} textAlignVertical={multiline ? 'top' : 'center'} />{hint && <Text style={styles.hint}>{hint}</Text>}</View>;
}

const styles = StyleSheet.create({ field: { gap: 7 }, label: { color: colors.text, fontWeight: '800' }, hint: { color: colors.textMuted, fontSize: 12, lineHeight: 18 }, input: { minHeight: 50, paddingHorizontal: 14, borderRadius: 14, color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, multiline: { minHeight: 110, paddingTop: 13 } });
