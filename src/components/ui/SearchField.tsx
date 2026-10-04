import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors } from '../../theme/colors';

export function SearchField({ value, onChangeText, placeholder }: { value: string; onChangeText(value: string): void; placeholder: string }) {
  return <View style={styles.container}><Feather name="search" size={20} color={colors.primary} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} accessibilityLabel={placeholder} placeholderTextColor={colors.textMuted} style={styles.input} returnKeyType="search" autoCorrect={false} />{Boolean(value) && <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => onChangeText('')} hitSlop={10}><Feather name="x" size={19} color={colors.textMuted} /></Pressable>}</View>;
}

const styles = StyleSheet.create({ container: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 } });
