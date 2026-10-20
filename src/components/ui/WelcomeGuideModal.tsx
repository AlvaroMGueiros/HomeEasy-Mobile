import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText as Text } from './AppText';
import { GettingStartedGoal, gettingStartedGuides } from '../../config/gettingStarted';
import { colors } from '../../theme/colors';
import { hasSeenWelcomeGuide, markWelcomeGuideSeen } from '../../utils/welcomeGuide';
import { AppButton } from './AppButton';

export function WelcomeGuideModal({ userId, onStart }: { userId: string; onStart(goal: GettingStartedGoal): void }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    hasSeenWelcomeGuide(userId)
      .then(seen => { if (active) setVisible(!seen); })
      .catch(() => { if (active) setVisible(true); });
    return () => { active = false; };
  }, [userId]);

  function close(goal?: GettingStartedGoal) {
    setVisible(false);
    // Optional guidance must not block use if the device cannot persist this preference.
    void markWelcomeGuideSeen(userId).catch(() => undefined);
    if (goal) onStart(goal);
  }

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={() => close()}>
    <View style={[styles.overlay, { paddingTop: Math.max(insets.top, 20) }]}>
      <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>O que você quer fazer?</Text>
          <AppButton label={gettingStartedGuides[GettingStartedGoal.FindProfessional].action} onPress={() => close(GettingStartedGoal.FindProfessional)} />
          <AppButton label={gettingStartedGuides[GettingStartedGoal.OfferServices].action} variant="secondary" onPress={() => close(GettingStartedGoal.OfferServices)} />
          <AppButton label="Agora não" variant="secondary" onPress={() => close()} />
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { maxHeight: '95%', paddingHorizontal: 20, paddingTop: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background },
  content: { gap: 18 }, title: { color: colors.text, fontSize: 24, fontWeight: '800' }
});
