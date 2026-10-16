import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '../components/ui/BrandLogo';
import { colors } from '../theme/colors';

export function SplashScreen() {
  return <SafeAreaView style={styles.container}>
    <View pointerEvents="none" accessible={false} style={styles.topShape} />
    <View pointerEvents="none" accessible={false} style={styles.bottomShape} />
    <View style={styles.content}>
      <View style={styles.brandCard}><BrandLogo style={styles.logo} /></View>
      <View style={styles.copy}><Text style={styles.title}>Sua casa, em boas mãos.</Text></View>
    </View>
    <View accessibilityRole="progressbar" accessibilityLabel="Carregando o Home Easy" style={styles.loading}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={styles.loadingLabel}>Preparando seu espaço...</Text>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: colors.background, overflow: 'hidden' },
  topShape: { position: 'absolute', top: -160, right: -150, width: 360, height: 360, borderRadius: 180, backgroundColor: colors.primarySoft },
  bottomShape: { position: 'absolute', bottom: -170, left: -180, width: 350, height: 350, borderRadius: 175, borderWidth: 40, borderColor: colors.successSoft },
  content: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 30 },
  brandCard: { width: 224, height: 224, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  logo: { width: 290, height: 220 },
  copy: { alignItems: 'center', gap: 12, maxWidth: 320 },
  title: { color: colors.text, fontSize: 24, lineHeight: 31, fontWeight: '800', textAlign: 'center' },
  loading: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24, paddingBottom: 24 },
  loadingLabel: { color: colors.primary, fontSize: 13, fontWeight: '600' }
});
