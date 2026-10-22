import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '../../auth/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { Highlight } from '../../types/highlights';
import { formatHighlightDate } from '../../utils/highlights';
import { shareProfessional } from '../../utils/shareProfessional';
import { AppText } from '../ui/AppText';
import { HighlightAuthor } from './HighlightAuthor';
import { HighlightGallery } from './HighlightGallery';
import { ProfessionalReviewCard } from './ProfessionalReviewCard';

export function HighlightCard({ highlight, isFavorite = false, favoriteBusy = false, onFavorite, showActions = true }: { highlight: Highlight; isFavorite?: boolean; favoriteBusy?: boolean; onFavorite?(): void; showActions?: boolean }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const professional = highlight.professional;
  const ownPublication = professional.id === user?.id;
  const canExpand = highlight.description.length > 140;
  const descriptionPreview = canExpand && !expanded ? `${highlight.description.slice(0, 140).trimEnd()}…` : highlight.description;
  const subtitle = [professional.city, professional.state].filter(Boolean).join(', ');

  function viewProfile() { navigation.navigate('Professional', { professionalId: professional.id }); }
  function viewReviews() { navigation.navigate('ProfessionalReviews', { professionalId: professional.id, professionalName: professional.name }); }
  function openPublicationMenu() {
    const options = [{ text: 'Ver perfil', onPress: viewProfile }, { text: 'Minhas publicações', onPress: () => navigation.navigate('MyHighlights') }];
    if (!ownPublication) options[1] = { text: 'Denunciar publicação', onPress: () => navigation.navigate('Report', { targetUserId: professional.id, highlightId: highlight.id }) };
    Alert.alert('Publicação', undefined, [...options, { text: 'Cancelar', style: 'cancel' }]);
  }
  async function sharePublication() {
    try { await shareProfessional(professional, `${highlight.title}\n${professional.name} — ${highlight.serviceName || 'Serviço'}\n${subtitle}`); }
    catch { Alert.alert('Compartilhamento indisponível', 'Não foi possível compartilhar este profissional. Tente novamente.'); }
  }
  function requestQuote() {
    if (!user) { navigation.navigate('Login'); return; }
    navigation.navigate('RequestForm', { serviceId: highlight.serviceId, serviceName: highlight.serviceName || 'Serviço', professionalId: professional.id });
  }

  return <View style={styles.card}>
    <View style={styles.header}>
      <HighlightAuthor professional={professional} subtitle={subtitle} onPress={viewProfile} onReviews={viewReviews} />
      {highlight.isSponsored && <AppText style={styles.sponsored}>Patrocinado</AppText>}
      {showActions && <Pressable accessibilityRole="button" accessibilityLabel="Opções da publicação" style={styles.iconButton} onPress={openPublicationMenu}><Feather name="more-vertical" size={20} color={colors.textMuted} /></Pressable>}
    </View>
    <HighlightGallery mediaIds={highlight.mediaIds} title={highlight.title} serviceName={highlight.serviceName} aspectRatio={16 / 9} showIndicators />
    <View style={styles.copy}>
      <AppText style={styles.title}>{highlight.title}</AppText>
      <AppText style={styles.description}>{descriptionPreview}</AppText>
      {canExpand && <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(current => !current)} style={styles.readMore}><AppText style={styles.readMoreText}>{expanded ? 'Ver menos' : 'Ver mais'}</AppText></Pressable>}
      <AppText style={styles.publishedAt}>{formatHighlightDate(highlight.createdAt)}</AppText>
    </View>
    {highlight.latestReview && <View style={styles.review}>
      <AppText style={styles.reviewLabel}>Avaliação recente do profissional</AppText>
      <ProfessionalReviewCard review={highlight.latestReview} compact />
      <Pressable accessibilityRole="button" onPress={viewReviews} style={styles.readMore}><AppText style={styles.readMoreText}>Ver todas as avaliações</AppText></Pressable>
    </View>}
    {showActions && <View style={styles.actions}>
      {onFavorite && !ownPublication && <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remover profissional dos favoritos' : 'Salvar profissional nos favoritos'} accessibilityState={{ selected: isFavorite, disabled: favoriteBusy }} disabled={favoriteBusy} onPress={onFavorite} style={styles.action}><Feather name="bookmark" size={18} color={isFavorite ? colors.primary : colors.textMuted} /><AppText style={[styles.actionText, isFavorite && styles.saved]}>{isFavorite ? 'Salvo' : 'Salvar'}</AppText></Pressable>}
      <Pressable accessibilityRole="button" accessibilityLabel="Compartilhar profissional" onPress={() => void sharePublication()} style={styles.action}><Feather name="share-2" size={18} color={colors.textMuted} /><AppText style={styles.actionText}>Compartilhar</AppText></Pressable>
      {!ownPublication && <Pressable accessibilityRole="button" accessibilityLabel={`Solicitar orçamento a ${professional.name}`} onPress={requestQuote} style={[styles.action, styles.quote]}><Feather name="message-circle" size={18} color={colors.white} /><AppText style={styles.quoteText}>Solicitar orçamento</AppText></Pressable>}
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  header: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 3 }, iconButton: { minWidth: 32, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, sponsored: { color: colors.textMuted, backgroundColor: colors.background, paddingHorizontal: 7, paddingVertical: 6, borderRadius: 10, fontSize: 9 },
  copy: { padding: 14, gap: 7 }, title: { color: colors.text, fontSize: 17, lineHeight: 24, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 21 }, publishedAt: { color: colors.textMuted, fontSize: 10 },
  readMore: { minHeight: 36, justifyContent: 'center', alignSelf: 'flex-start' }, readMoreText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  review: { paddingHorizontal: 14, paddingBottom: 12, gap: 9 }, reviewLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, padding: 10, gap: 5 },
  action: { flexGrow: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 8 },
  actionText: { color: colors.textMuted, fontSize: 10, fontWeight: '600' }, saved: { color: colors.primary }, quote: { backgroundColor: colors.primary, paddingHorizontal: 12 }, quoteText: { color: colors.white, fontSize: 11, fontWeight: '800' },
});
