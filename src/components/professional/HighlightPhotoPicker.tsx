import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { resolvePublicMediaUrl } from '../../utils/media-url';
import { AppText } from '../ui/AppText';
import { HighlightGallery } from './HighlightGallery';

export function HighlightPhotoPicker({ photos, selectedIds, disabled, onSelect }: { photos: NonNullable<Professional['portfolioPhotos']>; selectedIds: string[]; disabled: boolean; onSelect(mediaId: string): void }) {
  const [expanded, setExpanded] = useState(false);
  return <View style={styles.container}>
    {selectedIds.length > 0 && <HighlightGallery mediaIds={selectedIds} title="Fotos da publicação" />}
    <Pressable accessibilityRole="button" accessibilityState={{ expanded, disabled }} disabled={disabled} onPress={() => setExpanded(current => !current)} style={styles.trigger}>
      <View style={styles.icon}><Feather name="image" size={23} color={colors.success} /></View>
      <View style={styles.copy}><AppText style={styles.title}>Fotos do trabalho</AppText><AppText style={styles.subtitle}>{selectedIds.length ? `${selectedIds.length} de 3 selecionadas` : 'Escolha até 3 fotos do portfólio'}</AppText></View>
      <Feather name={expanded ? 'chevron-up' : 'plus'} size={20} color={colors.primary} />
    </Pressable>
    {expanded && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
      {photos.map(photo => {
        const position = selectedIds.indexOf(photo.mediaId);
        return <Pressable key={photo.mediaId} accessibilityRole="checkbox" accessibilityLabel={photo.caption || 'Foto do portfólio'} accessibilityState={{ checked: position >= 0, disabled }} disabled={disabled} onPress={() => onSelect(photo.mediaId)} style={[styles.photo, position >= 0 && styles.selected]}>
          <Image source={{ uri: resolvePublicMediaUrl(photo.mediaId) }} style={styles.image} />
          <View style={[styles.check, position >= 0 && styles.checked]}>{position >= 0 && <AppText style={styles.position}>{position + 1}</AppText>}</View>
        </Pressable>;
      })}
    </ScrollView>}
  </View>;
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' },
  trigger: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, minHeight: 76 },
  icon: { backgroundColor: colors.successSoft, width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 4 }, title: { color: colors.text, fontSize: 14, fontWeight: '700' }, subtitle: { color: colors.textMuted, fontSize: 12 },
  photos: { gap: 10, padding: 14, paddingTop: 0 }, photo: { width: 112, height: 112, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: colors.border }, selected: { borderColor: colors.primary },
  image: { width: '100%', height: '100%', backgroundColor: colors.primarySoft }, check: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.white, backgroundColor: colors.surface },
  checked: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, position: { color: colors.white, fontSize: 12, fontWeight: '800' },
});
