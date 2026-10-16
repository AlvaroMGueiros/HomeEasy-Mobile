import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '../components/ui/BrandLogo';
import { colors } from '../theme/colors';

export function SplashScreen() {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    let preferenceChanged = false;

    function updateMotion(reduceMotion: boolean) {
      if (!active) return;
      animation?.stop();
      entrance.setValue(reduceMotion ? 1 : 0);
      if (reduceMotion) return;
      animation = Animated.timing(entrance, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true });
      animation.start();
    }

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', reduceMotion => {
      preferenceChanged = true;
      updateMotion(reduceMotion);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(reduceMotion => {
      if (!preferenceChanged) updateMotion(reduceMotion);
    }).catch(() => { if (!preferenceChanged) updateMotion(true); });
    return () => { active = false; subscription.remove(); animation?.stop(); };
  }, [entrance]);

  return <SafeAreaView style={styles.container}>
    <StatusBar style="light" />
    <View style={styles.content}>
      <Animated.View style={{ opacity: entrance }}>
        <BrandLogo light style={styles.logo} />
      </Animated.View>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logo: { width: 196, height: 168 }
});
