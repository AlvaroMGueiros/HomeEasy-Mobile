import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { ProfessionalPhoto, ProfessionalPhotoKind } from '../../types/api';
import { resolvePublicMediaUrl } from '../../utils/media-url';

export function ProfessionalPortfolioPhoto({ photo }: { photo: ProfessionalPhoto }) {
  const [failed, setFailed] = useState(false);
  return <View style={styles.container}>
    {failed ? <View style={styles.placeholder}><Text style={styles.caption}>Foto indisponível</Text></View> : <Image source={{ uri: resolvePublicMediaUrl(photo.mediaId) }} style={styles.image} onError={() => setFailed(true)} accessibilityLabel={photo.caption || 'Foto do serviço'} />}
    <Text style={styles.kind}>{photo.kind === ProfessionalPhotoKind.Completed ? 'Serviço concluído' : 'Serviço oferecido'}</Text>
    {Boolean(photo.caption) && <Text style={styles.caption}>{photo.caption}</Text>}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: 8 }, image: { width: '100%', aspectRatio: 4 / 3, borderRadius: 16, backgroundColor: colors.border }, placeholder: { aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border, borderRadius: 16 }, kind: { color: colors.primary, fontWeight: '800', fontSize: 12 }, caption: { color: colors.textMuted, lineHeight: 20 } });
