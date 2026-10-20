import { Feather } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';

import { AppText as Text } from '../ui/AppText';
import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { resolvePublicMediaUrl } from '../../utils/media-url';
import { UserAvatar } from '../ui/UserAvatar';
import { ProfessionalReputation } from './ProfessionalReputation';

export function ProfessionalProfileHeader({ professional, specialty, location }: { professional: Professional; specialty: string; location: string }) {
  return <View style={styles.container}>
    <View style={styles.cover}>
      {professional.coverPhotoMediaId && <Image source={{ uri: resolvePublicMediaUrl(professional.coverPhotoMediaId) }} style={StyleSheet.absoluteFill} accessibilityLabel="Capa do perfil profissional" />}
    </View>
    <View style={styles.identity}>
      <View style={styles.avatar}><UserAvatar key={professional.id} name={professional.name} mediaId={professional.profilePhotoMediaId} size={88} /></View>
      <Text style={styles.name}>{professional.name}</Text>
      <Text style={styles.specialty}>{specialty}</Text>
      <View style={styles.location}><Feather name="map-pin" size={12} color={colors.textMuted} /><Text style={styles.locationText}>{location}</Text></View>
      <ProfessionalReputation professional={professional} compact />
    </View>
  </View>;
}

const styles = StyleSheet.create({ container: { backgroundColor: colors.surface }, cover: { height: 132, overflow: 'hidden', backgroundColor: colors.primarySoft }, identity: { paddingHorizontal: 20, paddingTop: 53, paddingBottom: 16, gap: 7 }, avatar: { position: 'absolute', left: 20, top: -48, padding: 4, borderRadius: 50, backgroundColor: colors.surface }, name: { color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: '800' }, specialty: { color: colors.text, fontSize: 14, lineHeight: 20 }, location: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }, locationText: { color: colors.textMuted, fontSize: 12 } });
