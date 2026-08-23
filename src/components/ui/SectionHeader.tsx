import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
export function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <View style={styles.container}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}<Text style={styles.title}>{title}</Text>{description && <Text style={styles.description}>{description}</Text>}</View>;
}
const styles = StyleSheet.create({ container: { gap: 6 }, eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }, title: { color: colors.text, fontSize: 30, lineHeight: 35, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 15, lineHeight: 22 } });
