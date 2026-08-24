import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { resolvePublicMediaUrl } from '../../utils/media-url';
import { resolveUserInitials } from '../../utils/user-name';

export function UserAvatar({ name, mediaId, size = 52 }: { name: string; mediaId?: string | null; size?: number }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = resolvePublicMediaUrl(mediaId);
  const avatarStyle = { width: size, height: size, borderRadius: size / 2 };

  if (imageUrl && !hasImageError) {
    return <Image source={{ uri: imageUrl }} style={[styles.image, avatarStyle]} onError={() => setHasImageError(true)} accessibilityLabel={`Foto de ${name}`} />;
  }

  return <View style={[styles.fallback, avatarStyle]} accessibilityLabel={`Avatar de ${name}`}><Text style={[styles.initials, { fontSize: size * 0.32 }]}>{resolveUserInitials(name)}</Text></View>;
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.border },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  initials: { color: colors.white, fontWeight: '900' }
});
