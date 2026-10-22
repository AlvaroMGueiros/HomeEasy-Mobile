import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '../../auth/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { Highlight } from '../../types/highlights';
import { formatHighlightDate } from '../../utils/highlights';
import { AppText } from '../ui/AppText';
import { HighlightAuthor } from './HighlightAuthor';
import { HighlightGallery } from './HighlightGallery';
import { ProfessionalReputation } from './ProfessionalReputation';
import { ProfessionalReviewCard } from './ProfessionalReviewCard';

export function HighlightCard({ highlight, isFavorite = false, favoriteBusy = false, onFavorite, showActions = true }: { highlight: Highlight; isFavorite?: boolean; favoriteBusy?: boolean; onFavorite?(): void; showActions?: boolean }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const professional = highlight.professional;
  const ownPublication = professional.id === user?.id;
  const canExpand = highlight.description.length > 140;
  const descriptionPreview = canExpand && !expanded ? `${highlight.description.slice(0, 140).trimEnd()}…` : highlight.description;
  const subtitle = [highlight.isSponsored ? 'Patrocinado' : formatHighlightDate(highlight.createdAt), professional.city, professional.state].filter(Boolean).join(' · ');

  function viewProfile() { navigation.navigate('Professional', { professionalId: professional.id }); }
  function viewReviews() { navigation.navigate('ProfessionalReviews', { professionalId: professional.id, professionalName: professional.name }); }
  function reportPublication() { navigation.navigate('Report', { targetUserId: professional.id, highlightId: highlight.id }); }
  function requestQuote() {
    if (!user) { navigation.navigate('Login'); return; }
    navigation.navigate('RequestForm', { serviceId: highlight.serviceId, serviceName: highlight.serviceName || 'Serviço', professionalId: professional.id });
  }

  return <View style={styles.card}>
    <View style={styles.header}>
      <HighlightAuthor professional={professional} subtitle={subtitle} onPress={viewProfile} />
      {showActions && !ownPublication && <Pressable accessibilityRole="button" accessibilityLabel="Denunciar publicação" style={styles.iconButton} onPress={reportPublication}><Feather name="flag" size={18} color={colors.textMuted} /></Pressable>}
    </View>
    <View style={styles.copy}>
      <View style={styles.serviceTag}><Feather name="briefcase" size={12} color={colors.primary} /><AppText style={styles.service}>{highlight.serviceName || 'Serviço'}</AppText></View>
      <AppText style={styles.title}>{highlight.title}</AppText>
      <AppText style={styles.description}>{descriptionPreview}</AppText>
      {canExpand && <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(current => !current)} style={styles.readMore}><AppText style={styles.readMoreText}>{expanded ? 'Ver menos' : 'Ver mais'}</AppText></Pressable>}
    </View>
    <HighlightGallery mediaIds={highlight.mediaIds} title={highlight.title} />
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver avaliações de ${professional.name}`} onPress={viewReviews} style={styles.reputation}>
      <View style={styles.grow}><ProfessionalReputation professional={professional} compact /></View><Feather name="chevron-right" size={16} color={colors.textMuted} />
    </Pressable>
    {highlight.latestReview && <View style={styles.review}>
      <AppText style={styles.reviewLabel}>Avaliação recente do profissional</AppText>
      <ProfessionalReviewCard review={highlight.latestReview} />
      <Pressable accessibilityRole="button" onPress={viewReviews} style={styles.readMore}><AppText style={styles.readMoreText}>Ver todas as avaliações</AppText></Pressable>
    </View>}
    {showActions && <View style={styles.actions}>
      {onFavorite && !ownPublication && <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remover profissional dos favoritos' : 'Salvar profissional nos favoritos'} accessibilityState={{ selected: isFavorite, disabled: favoriteBusy }} disabled={favoriteBusy} onPress={onFavorite} style={styles.action}><Feather name="bookmark" size={19} color={isFavorite ? colors.primary : colors.textMuted} /><AppText style={[styles.actionText, isFavorite && styles.saved]}>{isFavorite ? 'Salvo' : 'Salvar'}</AppText></Pressable>}
      <Pressable accessibilityRole="button" onPress={viewProfile} style={styles.action}><Feather name="user" size={19} color={colors.textMuted} /><AppText style={styles.actionText}>Perfil</AppText></Pressable>
      {!ownPublication && <Pressable accessibilityRole="button" accessibilityLabel={`Pedir orçamento a ${professional.name}`} onPress={requestQuote} style={[styles.action, styles.quote]}><Feather name="message-square" size={17} color={colors.primary} /><AppText style={styles.quoteText}>Orçamento</AppText></Pressable>}
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  header: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 4 }, iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  copy: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 }, serviceTag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primarySoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 },
  service: { color: colors.primary, fontWeight: '700', fontSize: 11 }, title: { color: colors.text, fontSize: 17, lineHeight: 24, fontWeight: '800' }, description: { color: colors.text, fontSize: 14, lineHeight: 23 },
  readMore: { minHeight: 36, justifyContent: 'center', alignSelf: 'flex-start' }, readMoreText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  reputation: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, grow: { flex: 1 },
  review: { paddingHorizontal: 14, paddingBottom: 12, gap: 9 }, reviewLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingHorizontal: 8, paddingVertical: 8, gap: 4 },
  action: { flex: 1, minHeight: 44, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 4, paddingVertical: 8 },
  actionText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' }, saved: { color: colors.primary }, quote: { flex: 1.3, backgroundColor: colors.primarySoft }, quoteText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
});
