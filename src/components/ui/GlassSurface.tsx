import { BlurView } from 'expo-blur';
import type { PropsWithChildren, RefObject } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface GlassSurfaceProps {
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** No Android o desfoque precisa de um BlurTargetView com o conteúdo de trás. Sem ele, vira vidro translúcido. */
  blurTarget?: RefObject<View | null>;
}

/** Superfície "liquid glass": desfoque, véu branco translúcido e borda clara. */
export function GlassSurface({ children, style, radius = 24, blurTarget }: PropsWithChildren<GlassSurfaceProps>) {
  const canBlur = Platform.OS === 'ios' || Boolean(blurTarget);
  return <View style={[styles.frame, { borderRadius: radius }, style]}>
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: radius }]}>
      {canBlur && <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={50} blurTarget={blurTarget} blurMethod="dimezisBlurViewSdk31Plus" />}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: canBlur ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.95)' }]} />
      <View style={[StyleSheet.absoluteFill, styles.rim, { borderRadius: radius }]} />
    </View>
    {children}
  </View>;
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(16, 45, 45, 0.10)',
    shadowColor: '#102D2D',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  clip: { overflow: 'hidden' },
  rim: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.75)' },
});
