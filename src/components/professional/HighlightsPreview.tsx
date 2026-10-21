import { Feather } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { apiRequest } from '../../api/api-client';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { Highlight, HighlightsResponse } from '../../types/highlights';
import { buildHighlightsQuery } from '../../utils/highlights';
import { AppText } from '../ui/AppText';
import { UserAvatar } from '../ui/UserAvatar';
import { HighlightGallery } from './HighlightGallery';

export function HighlightsPreview({ city, state }: { city?: string; state?: string }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  useFocusEffect(useCallback(() => {
    let active = true; setHighlights([]);
    if (!city || !state) return;
    void apiRequest<HighlightsResponse>(`/highlights?${buildHighlightsQuery({ city, state }, '', 1, 3)}`)
      .then(response => { if (active) setHighlights(response.highlights); }).catch(() => undefined);
    return () => { active = false; };
  }, [city, state]));
  if (!highlights.length) return null;
  function viewAll() { navigation.navigate('App', { screen: 'Highlights', params: { city, state } }); }
  return <View style={styles.container}>
    <View style={styles.header}><AppText style={styles.heading}>Destaques na região</AppText><Pressable accessibilityRole="button" onPress={viewAll} style={styles.viewAll}><AppText style={styles.link}>Ver todos</AppText><Feather name="chevron-right" size={17} color={colors.primary} /></Pressable></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
      {highlights.map(highlight => <View key={highlight.id} style={styles.card}>
        <HighlightGallery mediaIds={highlight.mediaIds.slice(0, 1)} title={highlight.title} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver destaque: ${highlight.title}`} onPress={viewAll} style={styles.body}>
          {highlight.isSponsored && <AppText style={styles.sponsored}>Patrocinado</AppText>}
          <AppText style={styles.title} numberOfLines={2}>{highlight.title}</AppText>
          <View style={styles.identity}><UserAvatar size={32} name={highlight.professional.name} mediaId={highlight.professional.profilePhotoMediaId} /><View style={styles.grow}><AppText style={styles.name} numberOfLines={1}>{highlight.professional.name}</AppText><AppText style={styles.city}>{highlight.professional.city}</AppText></View></View>
        </Pressable>
      </View>)}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({ container: { gap: 12 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, heading: { color: colors.text, fontSize: 17, fontWeight: '800', flex: 1 }, viewAll: { flexDirection: 'row', alignItems: 'center', minHeight: 44 }, link: { color: colors.primary, fontSize: 12, fontWeight: '700' }, cards: { gap: 12 }, card: { width: 250, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, body: { padding: 13, gap: 12 }, title: { color: colors.text, fontSize: 15, fontWeight: '800' }, sponsored: { color: colors.textMuted, fontSize: 10 }, identity: { flexDirection: 'row', gap: 8, alignItems: 'center' }, grow: { flex: 1, gap: 2 }, name: { color: colors.text, fontSize: 12, fontWeight: '700' }, city: { color: colors.textMuted, fontSize: 11 } });
