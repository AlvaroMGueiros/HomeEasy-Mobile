import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../../theme/colors';

export function FormField({ label, multiline, ...inputProps }: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...inputProps} multiline={multiline} placeholderTextColor={colors.textMuted} style={[styles.input, multiline && styles.multiline]} textAlignVertical={multiline ? 'top' : 'center'} /></View>;
}

const styles = StyleSheet.create({ field: { gap: 7 }, label: { color: colors.text, fontWeight: '800' }, input: { minHeight: 50, paddingHorizontal: 14, borderRadius: 14, color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, multiline: { minHeight: 110, paddingTop: 13 } });
