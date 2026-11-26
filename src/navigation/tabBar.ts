import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Barra de abas flutuante (liquid glass): altura e distância da borda inferior. */
export const floatingTabBar = { height: 64, gap: 10, radius: 32 } as const;

/** Espaço que o conteúdo de uma aba precisa no fim para não ficar escondido atrás da barra flutuante. */
export function useTabBarClearance() {
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const insets = useSafeAreaInsets();
  if (tabBarHeight === undefined) return 0;
  return floatingTabBar.height + floatingTabBar.gap + insets.bottom + 12;
}
