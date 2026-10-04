import { Feather } from '@expo/vector-icons';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { ProfessionalProfileAbout } from '../components/professional/ProfessionalProfileAbout';
import { ProfessionalProfileHeader } from '../components/professional/ProfessionalProfileHeader';
import { ProfessionalProfilePhotos } from '../components/professional/ProfessionalProfilePhotos';
import { ProfessionalProfileReviews } from '../components/professional/ProfessionalProfileReviews';
import { ProfessionalProfileTab, ProfessionalProfileTabs } from '../components/professional/ProfessionalProfileTabs';
import { ProfessionalServiceList } from '../components/professional/ProfessionalServiceList';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { StateView } from '../components/ui/StateView';
import { ProfileEditorSection, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Conversation, Favorite, Professional, ProfessionalReviewsResponse, ProfessionalService, Schedule } from '../types/api';
import { resolveProfessionalProfileSummary } from '../utils/professional-profile';

export function ProfessionalScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Professional'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviews, setReviews] = useState<ProfessionalReviewsResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationFailed, setConversationFailed] = useState(false);
  const [activeTab, setActiveTab] = useState(ProfessionalProfileTab.About);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const isOwnProfile = user?.id === params.professionalId;
  const summary = useMemo(() => professional ? resolveProfessionalProfileSummary(professional) : null, [professional]);

  useEffect(() => {
    setActiveTab(ProfessionalProfileTab.About);
    setPickerVisible(false);
  }, [params.professionalId]);

  useEffect(() => {
    let active = true;
    setProfileLoading(true);
    setProfileError('');
    setReviews(null);
    setReviewsError('');
    setReviewsLoading(true);
    setSchedule(null);
    setIsFavorite(false);
    setConversation(null);
    setConversationFailed(false);

    void apiRequest<Professional>(`/professionals/${params.professionalId}`)
      .then(response => { if (active) setProfessional(response); })
      .catch(() => { if (active) setProfileError('Não foi possível carregar este perfil. Verifique sua conexão e tente novamente.'); })
      .finally(() => { if (active) setProfileLoading(false); });

    void apiRequest<ProfessionalReviewsResponse>(`/professionals/${params.professionalId}/reviews`)
      .then(response => { if (active) setReviews(response); })
      .catch(() => { if (active) setReviewsError('Não foi possível carregar as avaliações deste profissional.'); })
      .finally(() => { if (active) setReviewsLoading(false); });

    void apiRequest<Schedule>(`/schedules/${params.professionalId}`)
      .then(response => { if (active) setSchedule(response); })
      .catch(() => undefined);

    if (user) {
      setFavoriteLoading(true);
      setConversationLoading(true);
      void apiRequest<Favorite[]>('/favorites')
        .then(favorites => { if (active) setIsFavorite(favorites.some(favorite => (favorite.professional?.id || favorite.professionalId) === params.professionalId)); })
        .catch(() => undefined)
        .finally(() => { if (active) setFavoriteLoading(false); });
      void apiRequest<Conversation[]>('/conversations')
        .then(conversations => { if (active) setConversation(conversations.find(currentConversation => currentConversation.otherUser.id === params.professionalId) || null); })
        .catch(() => { if (active) setConversationFailed(true); })
        .finally(() => { if (active) setConversationLoading(false); });
    } else {
      setFavoriteLoading(false);
      setConversationLoading(false);
    }
    return () => { active = false; };
  }, [params.professionalId, user?.id, refreshVersion]);

  const toggleFavorite = useCallback(async () => {
    if (!user) { navigation.navigate('Login'); return; }
    if (favoriteLoading || isOwnProfile) return;
    setFavoriteLoading(true);
    try {
      await apiRequest(`/favorites/${params.professionalId}`, { method: isFavorite ? 'DELETE' : 'PUT' });
      setIsFavorite(current => !current);
    } catch {
      Alert.alert('Favoritos não atualizados', 'Não foi possível salvar sua escolha. Tente novamente.');
    } finally {
      setFavoriteLoading(false);
    }
  }, [user, navigation, favoriteLoading, isOwnProfile, params.professionalId, isFavorite]);

  const shareProfile = useCallback(async () => {
    if (!professional || !summary) return;
    try {
      await Share.share({ title: professional.name, message: `${professional.name} — ${summary.specialty}\n${summary.location}\nConheça este profissional no Home Easy.` });
    } catch {
      Alert.alert('Não foi possível compartilhar', 'Tente compartilhar o perfil novamente.');
    }
  }, [professional, summary]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Perfil profissional',
      headerStyle: { backgroundColor: colors.surface },
      headerRight: () => <View style={styles.headerActions}>
        {!isOwnProfile && <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} accessibilityState={{ selected: isFavorite, disabled: favoriteLoading }} disabled={favoriteLoading || !professional} onPress={() => void toggleFavorite()} style={styles.headerAction}>{favoriteLoading ? <ActivityIndicator size="small" color={colors.primary} /> : <Feather name="heart" size={21} color={isFavorite ? colors.accent : colors.primary} />}</Pressable>}
        <Pressable accessibilityRole="button" accessibilityLabel="Compartilhar informações do perfil" disabled={!professional} onPress={() => void shareProfile()} style={styles.headerAction}><Feather name="share" size={20} color={colors.primary} /></Pressable>
      </View>
    });
  }, [navigation, professional, isOwnProfile, isFavorite, favoriteLoading, toggleFavorite, shareProfile]);

  useFocusEffect(useCallback(() => { setRefreshVersion(current => current + 1); }, []));

  function refreshProfile() { setRefreshVersion(current => current + 1); }

  function startRequest(service: ProfessionalService) {
    setPickerVisible(false);
    if (!user) { navigation.navigate('Login'); return; }
    if (!professional || isOwnProfile) return;
    navigation.navigate('RequestForm', { serviceId: service.id, serviceName: service.name, professionalId: professional.id });
  }

  function requestQuote() {
    if (!summary?.activeServices.length || isOwnProfile) return;
    if (summary.activeServices.length === 1) { startRequest(summary.activeServices[0]); return; }
    setPickerVisible(true);
  }

  function openConversation() {
    if (!user) { navigation.navigate('Login'); return; }
    if (conversationFailed) {
      Alert.alert('Conversa indisponível', 'Não foi possível consultar suas conversas. Puxe o perfil para baixo para atualizar e tente novamente.');
      return;
    }
    if (!conversation) {
      Alert.alert('Converse com o profissional', 'Solicite um orçamento primeiro. Quando uma proposta for aceita, a conversa do serviço ficará disponível em Mensagens.');
      return;
    }
    navigation.navigate('Chat', { conversationId: conversation.id, otherUserId: conversation.otherUser.id, otherUserName: conversation.otherUser.name, serviceName: conversation.service.name, isWritable: conversation.isWritable });
  }

  function viewAllReviews() {
    if (!professional) return;
    navigation.navigate('ProfessionalReviews', { professionalId: professional.id, professionalName: professional.name });
  }

  if (!professional || professional.id !== params.professionalId || !summary) {
    return <Screen><StateView loading={profileLoading} icon="user" title={profileError ? 'Perfil indisponível' : undefined} message={profileError || 'Carregando perfil profissional...'} onAction={profileError ? refreshProfile : undefined} /></Screen>;
  }

  return <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
    <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]} contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={profileLoading} onRefresh={refreshProfile} tintColor={colors.primary} colors={[colors.primary]} />}>
      <ProfessionalProfileHeader professional={professional} specialty={summary.specialty} location={summary.location} />
      <ProfessionalProfileTabs value={activeTab} onChange={setActiveTab} />
      <View style={styles.body}>
        {Boolean(profileError) && <StateView message={profileError} onAction={refreshProfile} />}
        {activeTab === ProfessionalProfileTab.About && <>
          <ProfessionalProfileAbout professional={professional} priceLabel={summary.priceLabel} coverage={summary.coverage} schedule={schedule} />
          <ProfessionalProfileReviews response={reviews} loading={reviewsLoading} error={reviewsError} preview onRetry={refreshProfile} onViewAll={viewAllReviews} />
        </>}
        {activeTab === ProfessionalProfileTab.Services && <ProfessionalServiceList services={summary.activeServices} onSelect={startRequest} canRequest={!isOwnProfile} />}
        {activeTab === ProfessionalProfileTab.Reviews && <ProfessionalProfileReviews response={reviews} loading={reviewsLoading} error={reviewsError} onRetry={refreshProfile} onViewAll={viewAllReviews} />}
        {activeTab === ProfessionalProfileTab.Photos && <ProfessionalProfilePhotos professional={professional} />}
        {!isOwnProfile && <Pressable accessibilityRole="button" onPress={() => user ? navigation.navigate('Report', { targetUserId: professional.id }) : navigation.navigate('Login')} style={styles.report}><Feather name="flag" size={14} color={colors.textMuted} /><Text style={styles.reportText}>Denunciar este perfil</Text></Pressable>}
      </View>
    </ScrollView>
    <View style={styles.footer}>
      <View style={styles.footerAction}>
        <Text style={styles.footerHint}>{isOwnProfile ? 'Este é seu perfil profissional' : summary.priceLabel}</Text>
        <AppButton label={isOwnProfile ? 'Editar apresentação e fotos' : 'Solicitar orçamento'} onPress={() => isOwnProfile ? navigation.navigate('EditProfile', { section: ProfileEditorSection.Professional }) : requestQuote()} disabled={!isOwnProfile && !summary.activeServices.length} />
      </View>
      {!isOwnProfile && <Pressable accessibilityRole="button" accessibilityLabel={conversation ? 'Abrir conversa com o profissional' : 'Como conversar com o profissional'} disabled={conversationLoading} onPress={openConversation} style={styles.chatButton}>{conversationLoading ? <ActivityIndicator color={colors.primary} /> : <Feather name="message-circle" size={23} color={colors.primary} />}</Pressable>}
    </View>
    <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
      <View style={styles.pickerOverlay}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Fechar seleção de serviço" onPress={() => setPickerVisible(false)} />
        <View style={[styles.picker, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.pickerHeader}><View style={styles.pickerHeading}><Text style={styles.pickerTitle}>Qual serviço você precisa?</Text><Text style={styles.pickerDescription}>Seu pedido será enviado a {professional.name}.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção de serviço" onPress={() => setPickerVisible(false)} style={styles.headerAction}><Feather name="x" size={23} color={colors.primary} /></Pressable></View>
          <ScrollView showsVerticalScrollIndicator={false}><ProfessionalServiceList services={summary.activeServices} onSelect={startRequest} compact /></ScrollView>
        </View>
      </View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  headerAction: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 22, backgroundColor: colors.background, flexGrow: 1 },
  report: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  reportText: { color: colors.textMuted, fontSize: 12 },
  footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  footerAction: { flex: 1, gap: 6 },
  footerHint: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  chatButton: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  pickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  picker: { maxHeight: '75%', padding: 20, gap: 18, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.background },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pickerHeading: { flex: 1, gap: 6 },
  pickerTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  pickerDescription: { color: colors.textMuted, fontSize: 13, lineHeight: 19 }
});
