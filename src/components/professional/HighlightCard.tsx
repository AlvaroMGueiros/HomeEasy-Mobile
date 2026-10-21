import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '../../auth/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { Highlight } from '../../types/highlights';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { UserAvatar } from '../ui/UserAvatar';
import { HighlightGallery } from './HighlightGallery';
import { ProfessionalReputation } from './ProfessionalReputation';

export function HighlightCard({ highlight, isFavorite = false, favoriteBusy = false, onFavorite, showActions = true }: { highlight: Highlight; isFavorite?: boolean; favoriteBusy?: boolean; onFavorite?(): void; showActions?: boolean }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const professional = highlight.professional;
  const ownPublication = professional.id === user?.id;
  function viewProfile() { navigation.navigate('Professional', { professionalId: professional.id }); }
  return <View style={styles.card}>
    <HighlightGallery mediaIds={highlight.mediaIds} title={highlight.title} />
    <View style={styles.content}>
      <View style={styles.meta}>
        <AppText style={styles.service}>{highlight.serviceName || 'Serviço'}</AppText>
        {highlight.isSponsored && <AppText style={styles.sponsored}>Patrocinado</AppText>}
      </View>
      <AppText style={styles.title}>{highlight.title}</AppText>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ver perfil de ${professional.name}`} onPress={viewProfile} style={styles.identity}>
        <UserAvatar name={professional.name} mediaId={professional.profilePhotoMediaId} size={44} />
        <View style={styles.identityCopy}><AppText style={styles.name}>{professional.name}</AppText><AppText style={styles.location}>{[professional.city, professional.state].filter(Boolean).join(', ')}</AppText></View>
        {onFavorite && !ownPublication && <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Favoritar profissional'} accessibilityState={{ selected: isFavorite, disabled: favoriteBusy }} disabled={favoriteBusy} onPress={event => { event.stopPropagation(); onFavorite(); }} style={styles.iconButton}><Feather name="heart" size={21} color={isFavorite ? colors.danger : colors.textMuted} /></Pressable>}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ver avaliações de ${professional.name}`} onPress={() => navigation.navigate('ProfessionalReviews', { professionalId: professional.id, professionalName: professional.name })}><ProfessionalReputation professional={professional} compact /></Pressable>
      <AppText style={styles.description}>{highlight.description}</AppText>
      {showActions && <>
        {!ownPublication && <AppButton label="Pedir orçamento" onPress={() => user ? navigation.navigate('RequestForm', { serviceId: highlight.serviceId, serviceName: highlight.serviceName || 'Serviço', professionalId: professional.id }) : navigation.navigate('Login')} />}
        <View style={styles.footer}><Pressable accessibilityRole="button" onPress={viewProfile} style={styles.link}><AppText style={styles.linkText}>Ver perfil</AppText><Feather name="arrow-right" size={16} color={colors.primary} /></Pressable>
          {!ownPublication && <Pressable accessibilityRole="button" accessibilityLabel="Denunciar publicação" style={styles.iconButton} onPress={() => navigation.navigate('Report', { targetUserId: professional.id, highlightId: highlight.id })}><Feather name="flag" size={16} color={colors.textMuted} /></Pressable>}
        </View>
      </>}
    </View>
  </View>;
}

const styles = StyleSheet.create({ card: { overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, content: { padding: 16, gap: 14 }, meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, service: { color: colors.primary, fontWeight: '700', fontSize: 12, flex: 1 }, sponsored: { color: colors.textMuted, fontSize: 11 }, title: { color: colors.text, fontSize: 21, fontWeight: '800' }, identity: { flexDirection: 'row', alignItems: 'center', gap: 10 }, identityCopy: { flex: 1, gap: 3 }, name: { color: colors.text, fontWeight: '700', fontSize: 14 }, location: { color: colors.textMuted, fontSize: 12 }, description: { color: colors.text, fontSize: 14, lineHeight: 22 }, iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, link: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }, linkText: { color: colors.primary, fontWeight: '700', fontSize: 13 } });
