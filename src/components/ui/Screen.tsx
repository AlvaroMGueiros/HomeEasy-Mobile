import { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';

export function Screen({ children, scroll = true, header }: PropsWithChildren<{ scroll?: boolean; header?: ReactNode }>) {
  const content = <View style={styles.content}>{header}{children}</View>;
  return <SafeAreaView style={styles.safe}>{scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1 }, content: { flex: 1, padding: 20, gap: 18 } });
