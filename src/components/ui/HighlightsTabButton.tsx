import { Feather } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { AppText } from './AppText';

export function HighlightsTabButton({ onPublish, ...props }: BottomTabBarButtonProps & { onPublish(): void }) {
  const selected = props['aria-selected'] === true;
  const transition = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    let active = true;
    let preferenceChanged = false;
    let animation: Animated.CompositeAnimation | undefined;
    function updateMotion(reduceMotion: boolean) {
      if (!active) return;
      animation?.stop();
      const target = selected ? 1 : 0;
      if (reduceMotion) { transition.setValue(target); return; }
      animation = Animated.timing(transition, { toValue: target, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true });
      animation.start();
    }
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', reduceMotion => { preferenceChanged = true; updateMotion(reduceMotion); });
    void AccessibilityInfo.isReduceMotionEnabled().then(reduceMotion => { if (!preferenceChanged) updateMotion(reduceMotion); })
      .catch(() => { if (!preferenceChanged) updateMotion(true); });
    return () => { active = false; animation?.stop(); subscription.remove(); };
  }, [selected, transition]);

  const inactiveOpacity = transition.interpolate({ inputRange: [0, 0.65, 1], outputRange: [1, 0, 0] });
  const activeOpacity = transition.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0, 1] });

  return <PlatformPressable {...props}
    role={selected ? 'button' : props.role}
    aria-label={selected ? 'Publicar trabalho' : props['aria-label']}
    aria-selected={selected ? undefined : props['aria-selected']}
    accessibilityLargeContentTitle={selected ? 'Publicar trabalho' : 'Destaques'}
    accessibilityHint={selected ? 'Abre uma nova publicação de trabalho' : 'Abre o feed de destaques da região'}
    href={selected ? undefined : props.href}
    pressOpacity={0.8}
    onPress={selected ? onPublish : props.onPress}
    style={[props.style, styles.button]}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.content}>
      <Animated.View style={[styles.star, { opacity: inactiveOpacity, transform: [{ rotate: transition.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }, { scale: transition.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] }) }] }]}><Feather name="star" size={24} color={colors.textMuted} /></Animated.View>
      <Animated.View style={[styles.circle, { opacity: activeOpacity, transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }, { scale: transition.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }]}>
        <Animated.View style={{ transform: [{ rotate: transition.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] }) }] }}><Feather name="plus" size={30} color={colors.white} /></Animated.View>
      </Animated.View>
      <View style={styles.labels}>
        <Animated.View style={[styles.labelLayer, { opacity: inactiveOpacity }]}><AppText style={[styles.label, styles.inactiveLabel]}>Destaques</AppText></Animated.View>
        <Animated.View style={[styles.labelLayer, { opacity: activeOpacity }]}><AppText style={styles.label}>Publicar</AppText></Animated.View>
      </View>
    </View>
  </PlatformPressable>;
}

const styles = StyleSheet.create({
  button: { overflow: 'visible' }, content: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'flex-end' },
  star: { position: 'absolute', bottom: 18, height: 32, width: 36, alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute', bottom: 12, width: 68, height: 68, borderRadius: 34, borderWidth: 6, borderColor: colors.surface, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  labels: { height: 16, alignSelf: 'stretch' }, labelLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.primary, fontSize: 10, fontWeight: '700', paddingBottom: 1 }, inactiveLabel: { color: colors.textMuted },
});
