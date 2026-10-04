import { Feather } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { MenuRow } from '../components/ui/MenuRow';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { UserAvatar } from '../components/ui/UserAvatar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { UserProfile } from '../types/api';
import { formatDate } from '../utils/date';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(useCallback(() => {
    apiRequest<UserProfile>('/users/me')
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []));

  const profileName = profile?.name || user?.name || 'Home Easy';
  const profileEmail = profile?.email || user?.email;
  const locationLabel = [profile?.city, profile?.state].filter(Boolean).join(', ');

  return <Screen>
    <SectionHeader eyebrow="Minha conta" title="Perfil" description="Seus dados e sua área profissional." />
    <View style={styles.profileCard}>
      <View style={styles.identity}>
        <UserAvatar name={profileName} mediaId={profile?.profilePhotoMediaId} size={64} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profileName}</Text>
          {Boolean(profileEmail) && <Text style={styles.email}>{profileEmail}</Text>}
          <View style={styles.roleBadge}><Text style={styles.role}>{user?.role === 'admin' ? 'Administrador' : 'Conta Home Easy'}</Text></View>
        </View>
      </View>
      <View style={styles.profileMeta}>
        <View style={styles.metaRow}><Feather name="map-pin" size={15} color={colors.textMuted} /><Text style={styles.meta}>{locationLabel || 'Localização não informada'}</Text></View>
        {profile?.memberSince && <View style={styles.metaRow}><Feather name="calendar" size={15} color={colors.textMuted} /><Text style={styles.meta}>Membro desde {formatDate(profile.memberSince)}</Text></View>}
      </View>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('EditProfile')} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
        <Feather name="edit-2" size={16} color={colors.primary} /><Text style={styles.editLabel}>Editar perfil</Text><Feather name="chevron-right" size={18} color={colors.primary} />
      </Pressable>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Minha atividade</Text>
      <View style={styles.menuCard}><MenuRow icon="heart" title="Favoritos" description="Profissionais que você salvou" onPress={() => navigation.navigate('Favorites')} /></View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Área profissional</Text>
      <View style={styles.menuCard}>
        <MenuRow icon="bar-chart-2" title="Painel profissional" description="Atendimentos e resultados" onPress={() => navigation.navigate('ProfessionalDashboard')} />
        <View style={styles.divider} />
        <MenuRow icon="briefcase" title="Perfil e serviços" description="Sua apresentação e serviços oferecidos" onPress={() => navigation.navigate('ProfessionalManager')} />
        <View style={styles.divider} />
        <MenuRow icon="calendar" title="Agenda" description="Organize sua disponibilidade" onPress={() => navigation.navigate('Schedule')} />
        <View style={styles.divider} />
        <MenuRow icon="shield" title="Verificação documental" description="Acompanhe seus documentos" onPress={() => navigation.navigate('Verification')} />
        <View style={styles.divider} />
        <MenuRow icon="search" title="Oportunidades" description="Encontre novas solicitações" onPress={() => navigation.navigate('Opportunities')} />
      </View>
    </View>

    {user?.role === 'admin' && <View style={styles.section}>
      <Text style={styles.sectionTitle}>Administração</Text>
      <View style={styles.menuCard}><MenuRow icon="settings" title="Painel administrativo" onPress={() => navigation.navigate('Admin')} /></View>
    </View>}

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Conta e privacidade</Text>
      <View style={styles.menuCard}>
        <MenuRow icon="lock" title="Política de privacidade" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <View style={styles.divider} />
        <MenuRow icon="log-out" title="Sair da conta" onPress={logout} />
        <View style={styles.divider} />
        <MenuRow icon="trash-2" title="Excluir minha conta" destructive onPress={() => navigation.navigate('DeleteAccount')} />
      </View>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  profileCard: { gap: 16, padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileInfo: { flex: 1, gap: 5 },
  name: { color: colors.text, fontSize: 20, lineHeight: 26, fontWeight: '800' },
  email: { color: colors.textMuted, fontSize: 13, lineHeight: 19, flexShrink: 1 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, backgroundColor: colors.primarySoft },
  role: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  profileMeta: { gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  editButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.primarySoft },
  editLabel: { flex: 1, color: colors.primary, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.75 },
  section: { gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  menuCard: { overflow: 'hidden', borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 66, backgroundColor: colors.border }
});
