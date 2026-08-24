import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

interface BrandPanelProps {
  title: string;
  description: string;
  compact?: boolean;
}

export function BrandPanel({ title, description, compact = false }: BrandPanelProps) {
  return <View style={[styles.panel, compact && styles.compactPanel]}>
    <Image
      source={require('../../../assets/home-easy-logo-v2.png')}
      style={[styles.logo, compact && styles.compactLogo]}
      resizeMode="contain"
      accessibilityLabel="Home Easy"
    />
    <View style={styles.copy}>
      <Text style={[styles.title, compact && styles.compactTitle]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  panel: { alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 28, borderRadius: 28, backgroundColor: colors.primary },
  compactPanel: { paddingVertical: 20 },
  logo: { width: 170, height: 142 },
  compactLogo: { width: 132, height: 104 },
  copy: { alignItems: 'center', gap: 8 },
  title: { maxWidth: 330, color: colors.white, fontSize: 28, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  compactTitle: { fontSize: 24, lineHeight: 30 },
  description: { maxWidth: 310, color: colors.white, fontSize: 15, lineHeight: 22, textAlign: 'center', opacity: 0.86 }
});
