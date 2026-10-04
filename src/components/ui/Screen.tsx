import { HeaderShownContext } from '@react-navigation/elements';
import { PropsWithChildren, ReactNode, useContext } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';

export function Screen({ children, scroll = true, header, refreshing = false, onRefresh }: PropsWithChildren<{ scroll?: boolean; header?: ReactNode; refreshing?: boolean; onRefresh?(): void }>) {
  const headerShown = useContext(HeaderShownContext);
  const content = <View style={styles.content}>{header}{children}</View>;
  return <SafeAreaView edges={headerShown ? ['left', 'right'] : ['top', 'left', 'right']} style={styles.safe}>{scroll ? <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}>{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1 }, content: { flex: 1, padding: 20, gap: 18 } });
