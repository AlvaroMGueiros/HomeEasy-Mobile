import { Image, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';

interface BrandLogoProps {
  light?: boolean;
  horizontal?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BrandLogo({ light = false, horizontal = false, style }: BrandLogoProps) {
  const tintColor = light ? colors.white : colors.primary;
  return <View style={[styles.container, horizontal && styles.horizontal, style]} accessible accessibilityLabel="Home Easy" accessibilityRole="image">
    <Image source={require('../../../assets/brand/symbol.png')} style={[styles.symbol, horizontal && styles.horizontalSymbol, { tintColor }]} resizeMode="contain" />
    <Image source={require('../../../assets/brand/wordmark.png')} style={[styles.wordmark, horizontal && styles.horizontalWordmark, { tintColor }]} resizeMode="contain" />
  </View>;
}

const styles = StyleSheet.create({
  container: { width: 170, height: 142, alignItems: 'center', justifyContent: 'center' },
  horizontal: { flexDirection: 'row', width: 132, height: 36 },
  symbol: { width: '85%', height: '75%' },
  wordmark: { width: '100%', height: '25%' },
  horizontalSymbol: { width: '26%', height: '100%' },
  horizontalWordmark: { width: '74%', height: '100%' }
});
