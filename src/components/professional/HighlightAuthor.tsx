import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { AppText } from '../ui/AppText';
import { UserAvatar } from '../ui/UserAvatar';

export function HighlightAuthor({ professional, subtitle, onPress }: { professional: Professional; subtitle?: string; onPress?(): void }) {
  const identity = <>
    <UserAvatar name={professional.name} mediaId={professional.profilePhotoMediaId} size={46} />
    <View style={styles.copy}>
      <AppText style={styles.name} numberOfLines={2}>{professional.name}</AppText>
      <View style={styles.meta}><Feather name="globe" size={12} color={colors.textMuted} /><AppText style={styles.subtitle}>{subtitle || [professional.city, professional.state].filter(Boolean).join(', ')}</AppText></View>
    </View>
  </>;
  if (!onPress) return <View style={styles.identity}>{identity}</View>;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver perfil de ${professional.name}`} onPress={onPress} style={styles.identity}>{identity}</Pressable>;
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  copy: { flex: 1, gap: 4 }, name: { color: colors.text, fontWeight: '800', fontSize: 15 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 }, subtitle: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 17 },
});
