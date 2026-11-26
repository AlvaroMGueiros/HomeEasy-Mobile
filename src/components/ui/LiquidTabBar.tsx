import type { BottomTabBarButtonProps, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { floatingTabBar } from '../../navigation/tabBar';
import { colors } from '../../theme/colors';
import { AppText as Text } from './AppText';
import { GlassSurface } from './GlassSurface';
import { Pressable } from './Pressable';

const lensInset = 4;

/**
 * Barra de abas no estilo liquid glass do iOS 26: cápsula de vidro flutuante e uma "lente"
 * que desliza até a aba escolhida, esticando um pouco no caminho.
 */
export function LiquidTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const [width, setWidth] = useState(0);
  const count = state.routes.length;
  const itemWidth = width / count;
  const position = useRef(new Animated.Value(state.index)).current;
  const stretch = useRef(new Animated.Value(0)).current;
  const reduceMotion = useRef(false);

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { reduceMotion.current = value; });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { reduceMotion.current = value; }).catch(() => undefined);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion.current) { position.setValue(state.index); return; }
    const animation = Animated.parallel([
      Animated.spring(position, { toValue: state.index, damping: 17, stiffness: 210, mass: 0.9, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(stretch, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(stretch, { toValue: 0, damping: 11, stiffness: 190, useNativeDriver: true }),
      ]),
    ]);
    animation.start();
    return () => animation.stop();
  }, [state.index, position, stretch]);

  const translateX = count > 1 && itemWidth > 0
    ? position.interpolate({ inputRange: [0, count - 1], outputRange: [0, (count - 1) * itemWidth] })
    : 0;
  const scaleX = stretch.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });
  const scaleY = stretch.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] });

  return <View pointerEvents="box-none" style={[styles.container, { bottom: insets.bottom + floatingTabBar.gap }]}>
    <GlassSurface radius={floatingTabBar.radius} style={styles.bar}>
      <View accessibilityRole="tablist" style={styles.row} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && <Animated.View pointerEvents="none" style={[styles.lens, { width: itemWidth - lensInset * 2, transform: [{ translateX }, { scaleX }, { scaleY }] }]} />}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

          if (options.tabBarButton) {
            const buttonProps: BottomTabBarButtonProps = { onPress, onLongPress, 'aria-selected': focused, 'aria-label': label, role: 'tab', style: styles.customButton, children: null };
            return <View key={route.key} style={styles.item}>{options.tabBarButton(buttonProps)}</View>;
          }

          const color = focused ? colors.primary : colors.textMuted;
          return <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label} onPress={onPress} onLongPress={onLongPress} style={styles.item}>
            {options.tabBarIcon?.({ focused, color, size: 22 })}
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[styles.label, { color }]}>{label}</Text>
          </Pressable>;
        })}
      </View>
    </GlassSurface>
  </View>;
}

const styles = StyleSheet.create({
  container: { position: 'absolute', right: 12, left: 12, height: floatingTabBar.height },
  bar: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  lens: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: lensInset,
    borderRadius: floatingTabBar.radius - 6,
    backgroundColor: 'rgba(8, 105, 121, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  customButton: { flex: 1, alignSelf: 'stretch', paddingBottom: 9 },
  label: { fontSize: 10, fontWeight: '500', paddingHorizontal: 2 },
});
