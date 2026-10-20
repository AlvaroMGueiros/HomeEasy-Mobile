import { StyleSheet, type TextProps } from 'react-native';

import { colors } from '../../theme/colors';
import { AppText } from './AppText';

export function FieldLabel({ label, required = false, style }: { label: string; required?: boolean; style?: TextProps['style'] }) {
  return <AppText style={style} accessibilityLabel={required ? `${label} (obrigatório)` : label}>
    {label}{required && <AppText style={styles.required}> *</AppText>}
  </AppText>;
}

const styles = StyleSheet.create({ required: { color: colors.danger, fontWeight: '800' } });
