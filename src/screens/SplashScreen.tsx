import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BrandLogo } from '../components/ui/BrandLogo';
import { colors } from '../theme/colors';
export function SplashScreen() { return <View style={styles.container}><BrandLogo light style={styles.logo} /><ActivityIndicator color={colors.white} /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, backgroundColor: colors.primary }, logo: { width: 230, height: 210 } });
