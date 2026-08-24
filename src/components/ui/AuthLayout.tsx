import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { BrandPanel } from './BrandPanel';

interface AuthLayoutProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
        <BrandPanel landing landingMinHeight={300} title={title} description={description} />
        <View style={styles.formPanel}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, backgroundColor: colors.surface },
  formPanel: { flexGrow: 1, gap: 12, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 32, backgroundColor: colors.surface }
});
