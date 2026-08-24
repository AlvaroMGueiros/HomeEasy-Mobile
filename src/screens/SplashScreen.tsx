import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
export function SplashScreen() { return <View style={styles.container}><Image source={require('../../assets/home-easy-logo-v2.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Home Easy" /><ActivityIndicator color={colors.white} /></View>; }
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, backgroundColor: colors.primary }, logo: { width: 230, height: 210 } });
