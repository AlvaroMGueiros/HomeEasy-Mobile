import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

interface BrandPanelProps {
  title: string;
  description: string;
  compact?: boolean;
  landing?: boolean;
  landingMinHeight?: number;
}

export function BrandPanel({ title, description, compact = false, landing = false, landingMinHeight }: BrandPanelProps) {
  const landingHeightStyle = landing && landingMinHeight ? { minHeight: landingMinHeight } : undefined;

  return <View style={[styles.panel, compact && styles.compactPanel, landing && styles.landingPanel, landingHeightStyle]}>
    <Image
      source={require('../../../assets/home-easy-logo-v2.png')}
      style={[styles.logo, compact && styles.compactLogo, landing && styles.landingLogo]}
      resizeMode="contain"
      accessibilityLabel="Home Easy"
    />
    <View style={styles.copy}>
      <Text style={[styles.title, compact && styles.compactTitle, landing && styles.landingTitle]}>{title}</Text>
      <Text style={[styles.description, landing && styles.landingDescription]}>{description}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  panel: { alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 28, borderRadius: 28, backgroundColor: colors.primary },
  compactPanel: { paddingVertical: 20 },
  landingPanel: { minHeight: 430, justifyContent: 'center', paddingTop: 48, paddingBottom: 76, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 42, borderBottomRightRadius: 42 },
  logo: { width: 170, height: 142 },
  compactLogo: { width: 132, height: 104 },
  landingLogo: { width: 126, height: 112 },
  copy: { alignItems: 'center', gap: 8 },
  title: { maxWidth: 330, color: colors.white, fontSize: 28, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  compactTitle: { fontSize: 24, lineHeight: 30 },
  landingTitle: { maxWidth: 300, fontSize: 27, lineHeight: 32 },
  description: { maxWidth: 310, color: colors.white, fontSize: 15, lineHeight: 22, textAlign: 'center', opacity: 0.86 },
  landingDescription: { maxWidth: 280, fontSize: 14, lineHeight: 20 }
});
