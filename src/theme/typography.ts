import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';

export const fontFamilies = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export function resolveFontStyle(style: StyleProp<TextStyle>): TextStyle {
  const flattenedStyle = StyleSheet.flatten(style);
  if (flattenedStyle?.fontFamily) return {};
  const weight = flattenedStyle?.fontWeight;
  const numericWeight = Number(weight);
  let fontFamily: string = fontFamilies.regular;
  if (numericWeight === 500) fontFamily = fontFamilies.medium;
  else if (numericWeight === 600) fontFamily = fontFamilies.semiBold;
  else if (numericWeight === 700 || weight === 'bold') fontFamily = fontFamilies.bold;
  else if (numericWeight >= 800) fontFamily = fontFamilies.extraBold;
  return { fontFamily, fontWeight: 'normal' };
}
