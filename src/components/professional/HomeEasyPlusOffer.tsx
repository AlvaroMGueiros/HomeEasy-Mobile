import { Feather } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiRequest } from '../../api/api-client';
import { isPlusBillingConfigured, loadPlusPackage } from '../../api/subscriptions';
import { useAuth } from '../../auth/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { HomeEasyPlusStatus } from '../../types/subscription';
import { canShowPlusOffer } from '../../utils/homeEasyPlus';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';

export function HomeEasyPlusOffer() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [eligible, setEligible] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true; setVisible(false); setEligible(false);
    if (!user || !isPlusBillingConfigured()) return;
    const accountId = user.id;
    void (async () => {
      const subscription = await apiRequest<HomeEasyPlusStatus>('/subscriptions/me');
      if (!subscription.enabled || subscription.active || !active) return;
      const professional = await apiRequest<Professional>('/professionals/me');
      if (!professional.isAvailable || !professional.city || !professional.state || !professional.portfolioPhotos?.length || !professional.services.some(service => service.isActive)) return;
      const monthlyPackage = await loadPlusPackage(accountId);
      if (!monthlyPackage || !active) return;
      setEligible(true);
      const key = `homeEasyPlusOffer.${accountId}`;
      const lastShownAt = await SecureStore.getItemAsync(key);
      if (!active || !canShowPlusOffer(lastShownAt)) return;
      await SecureStore.setItemAsync(key, String(Date.now()));
      if (active) setVisible(true);
    })().catch(() => undefined);
    return () => { active = false; setVisible(false); };
  }, [user?.id]));

  function viewPlan() { setVisible(false); navigation.navigate('HomeEasyPlus'); }
  if (!eligible) return null;
  return <>
    <Pressable accessibilityRole="button" onPress={viewPlan} style={styles.banner}><Feather name="star" size={21} color={colors.primary} /><View style={styles.copy}><AppText style={styles.bannerTitle}>Conheça o HomeEasy+</AppText><AppText style={styles.detail}>Mais publicações e fotos para seu perfil.</AppText></View><Feather name="chevron-right" size={18} color={colors.primary} /></Pressable>
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}><Pressable accessibilityRole="button" accessibilityLabel="Fechar oferta" style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.heading}><Feather name="star" size={28} color={colors.primary} /><Pressable accessibilityRole="button" accessibilityLabel="Fechar oferta" onPress={() => setVisible(false)} style={styles.close}><Feather name="x" size={23} color={colors.textMuted} /></Pressable></View>
          <AppText style={styles.title}>Seu trabalho merece mais espaço.</AppText><AppText style={styles.detail}>Com o HomeEasy+, publique até 12 trabalhos e amplie seu portfólio para 60 fotos.</AppText>
          <AppButton label="Conhecer o plano" onPress={viewPlan} /><AppButton label="Agora não" variant="secondary" onPress={() => setVisible(false)} />
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.primarySoft }, copy: { flex: 1, gap: 4 }, bannerTitle: { color: colors.primary, fontWeight: '800', fontSize: 14 }, detail: { color: colors.textMuted, fontSize: 13, lineHeight: 21 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }, sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 18 }, heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, title: { color: colors.text, fontSize: 25, fontWeight: '800', lineHeight: 33 },
});
