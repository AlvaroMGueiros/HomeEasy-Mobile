import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../../api/api-client';
import { colors } from '../../theme/colors';

interface PrivateMediaImageProps {
  mediaId: string;
  accessibilityLabel: string;
  compact?: boolean;
  wide?: boolean;
}

export function PrivateMediaImage({ mediaId, accessibilityLabel, compact = false, wide = false }: PrivateMediaImageProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    apiRequest<{ downloadUrl: string }>(`/media/${mediaId}/download`)
      .then(response => { if (active) setImageUrl(response.downloadUrl); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [mediaId]);

  if (failed) return <View style={[styles.fallback, compact && styles.compact, wide && styles.wide]}><Text style={styles.fallbackText}>Imagem indisponível</Text></View>;
  if (!imageUrl) return <View style={[styles.loading, compact && styles.compact, wide && styles.wide]}><ActivityIndicator color={colors.primary} /></View>;

  return <>
    <Pressable onPress={() => setExpanded(true)} accessibilityRole="imagebutton" accessibilityLabel={accessibilityLabel}>
      <Image source={{ uri: imageUrl }} style={[styles.image, compact && styles.compact, wide && styles.wide]} resizeMode="cover" onError={() => setFailed(true)} />
    </Pressable>
    <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
      <Pressable style={styles.overlay} onPress={() => setExpanded(false)}>
        <Image source={{ uri: imageUrl }} style={styles.expandedImage} resizeMode="contain" />
        <Text style={styles.close}>Toque para fechar</Text>
      </Pressable>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  image: { width: 220, height: 220, borderRadius: 12, backgroundColor: colors.border },
  compact: { width: 112, height: 112 },
  wide: { width: '100%', height: 175 },
  loading: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.surface },
  fallback: { width: 220, height: 90, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.surface },
  fallbackText: { color: colors.textMuted, fontSize: 12 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20, backgroundColor: colors.overlay },
  expandedImage: { width: '100%', height: '82%' },
  close: { color: colors.white, fontWeight: '800' }
});
