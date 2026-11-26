import { StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import { colors } from '../../theme/colors';
export function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <View style={styles.container}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}<Text style={styles.title}>{title}</Text>{description && <Text style={styles.description}>{description}</Text>}</View>;
}
const styles = StyleSheet.create({ container: { gap: 4 }, eyebrow: { color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: '500' }, title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '600' }, description: { color: colors.textMuted, fontSize: 15, lineHeight: 22 } });
