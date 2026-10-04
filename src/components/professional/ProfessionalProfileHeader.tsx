import { Feather } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { resolvePublicMediaUrl } from '../../utils/media-url';
import { resolveServiceIcon } from '../../utils/service-icon';
import { UserAvatar } from '../ui/UserAvatar';
import { ProfessionalReputation } from './ProfessionalReputation';

export function ProfessionalProfileHeader({ professional, specialty, location }: { professional: Professional; specialty: string; location: string }) {
  return <View style={styles.container}>
    <View style={styles.cover}>
      {professional.coverPhotoMediaId && <Image source={{ uri: resolvePublicMediaUrl(professional.coverPhotoMediaId) }} style={StyleSheet.absoluteFill} accessibilityLabel="Capa do perfil profissional" />}
      {!professional.coverPhotoMediaId && <><View style={styles.coverCircle} /><View style={styles.coverOutline} />
      <View style={styles.coverBrand}><Feather name="home" size={16} color={colors.primary} /><Text style={styles.coverBrandText}>home easy</Text></View>
      <View style={styles.serviceMark}><Feather name={resolveServiceIcon(specialty)} size={74} color={colors.coverLine} /></View></>}
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

const styles = StyleSheet.create({ container: { backgroundColor: colors.surface }, cover: { height: 132, overflow: 'hidden', backgroundColor: colors.primarySoft }, coverCircle: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: colors.coverAccent, right: -34, top: -116 }, coverOutline: { position: 'absolute', width: 178, height: 178, borderRadius: 32, borderWidth: 1, borderColor: colors.coverLine, transform: [{ rotate: '30deg' }], left: -54, top: -68 }, coverBrand: { position: 'absolute', right: 20, top: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }, coverBrandText: { color: colors.primary, fontSize: 13, fontWeight: '800' }, serviceMark: { position: 'absolute', right: 29, bottom: -12, transform: [{ rotate: '-10deg' }] }, identity: { paddingHorizontal: 20, paddingTop: 53, paddingBottom: 16, gap: 7 }, avatar: { position: 'absolute', left: 20, top: -48, padding: 4, borderRadius: 50, backgroundColor: colors.surface }, name: { color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: '800' }, specialty: { color: colors.text, fontSize: 14, lineHeight: 20 }, location: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }, locationText: { color: colors.textMuted, fontSize: 12 } });
