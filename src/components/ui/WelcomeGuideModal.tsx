import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GettingStartedGoal, gettingStartedGuides } from '../../config/gettingStarted';
import { colors } from '../../theme/colors';
import { hasSeenWelcomeGuide, markWelcomeGuideSeen } from '../../utils/welcomeGuide';
import { AppButton } from './AppButton';
import { GettingStartedGuide } from './GettingStartedGuide';

export function WelcomeGuideModal({ userId, onStart }: { userId: string; onStart(goal: GettingStartedGoal): void }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [goal, setGoal] = useState(GettingStartedGoal.FindProfessional);

  useEffect(() => {
    let active = true;
    hasSeenWelcomeGuide(userId)
      .then(seen => { if (active) setVisible(!seen); })
      .catch(() => { if (active) setVisible(true); });
    return () => { active = false; };
  }, [userId]);

  function close(start = false) {
    setVisible(false);
    // Optional guidance must not block use if the device cannot persist this preference.
    void markWelcomeGuideSeen(userId).catch(() => undefined);
    if (start) onStart(goal);
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={() => close()}>
    <View style={[styles.overlay, { paddingTop: Math.max(insets.top, 20) }]}>
      <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>Boas-vindas à Home Easy!</Text>
          <Text style={styles.description}>Veja como buscar um profissional ou oferecer seus serviços.</Text>
          <GettingStartedGuide goal={goal} onChange={setGoal} />
          <AppButton label={gettingStartedGuides[goal].action} onPress={() => close(true)} />
          <AppButton label="Explorar por conta própria" variant="secondary" onPress={() => close()} />
          <Text style={styles.description}>Você pode rever estas orientações em Perfil → Como usar o aplicativo.</Text>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { maxHeight: '95%', paddingHorizontal: 20, paddingTop: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background },
  content: { gap: 18 }, title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  description: { color: colors.textMuted, fontSize: 13, lineHeight: 20 }
});
