import { AppIcon } from '../ui/AppIcon';
import { Image, StyleSheet, View } from 'react-native';

import { AppText as Text } from '../ui/AppText';
import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { resolvePublicMediaUrl } from '../../utils/media-url';
import { UserAvatar } from '../ui/UserAvatar';
import { ProfessionalReputation } from './ProfessionalReputation';

export function ProfessionalProfileHeader({ professional, specialty, location }: { professional: Professional; specialty: string; location: string }) {
  // Sem capa, o espaço da capa não existe: a foto do perfil abre o cabeçalho.
  const hasCover = Boolean(professional.coverPhotoMediaId);
  return <View style={styles.container}>
    {hasCover && <View style={styles.cover}>
      <Image source={{ uri: resolvePublicMediaUrl(professional.coverPhotoMediaId!) }} style={StyleSheet.absoluteFill} accessibilityLabel="Capa do perfil profissional" />
    </View>}
    <View style={[styles.identity, !hasCover && styles.identityNoCover]}>
      <View style={[styles.avatar, !hasCover && styles.avatarNoCover]}><UserAvatar key={professional.id} name={professional.name} mediaId={professional.profilePhotoMediaId} size={88} /></View>
      <Text style={styles.name}>{professional.name}</Text>
      <Text style={styles.specialty}>{specialty}</Text>
      <View style={styles.location}><AppIcon name="map-pin" size={12} color={colors.textMuted} /><Text style={styles.locationText}>{location}</Text></View>
      <ProfessionalReputation professional={professional} compact />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface },
  cover: { height: 132, overflow: 'hidden', backgroundColor: colors.primarySoft },
  identity: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16, gap: 8 },
  identityNoCover: { paddingTop: 16 },
  avatar: { position: 'absolute', left: 20, top: -48, padding: 4, borderRadius: 52, backgroundColor: colors.surface },
  avatarNoCover: { position: 'relative', left: 0, top: 0, padding: 0, alignSelf: 'flex-start', marginBottom: 4 },
  name: { color: colors.text, fontSize: 26, lineHeight: 32, fontWeight: '600' },
  specialty: { color: colors.text, fontSize: 14, lineHeight: 20 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  locationText: { color: colors.textMuted, fontSize: 12 }
});
