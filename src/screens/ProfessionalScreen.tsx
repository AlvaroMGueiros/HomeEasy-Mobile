import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { StateView } from '../components/ui/StateView';
import { UserAvatar } from '../components/ui/UserAvatar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Favorite, Professional } from '../types/api';
import { formatCurrency } from '../utils/currency';

export function ProfessionalScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Professional'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (params.professionalId === user?.id) {
      setError('Você não pode contratar a própria conta.');
      return;
    }
    apiRequest<Professional>(`/professionals/${params.professionalId}`)
      .then(setProfessional)
      .catch(currentError => setError(currentError instanceof Error ? currentError.message : 'Não foi possível carregar o perfil profissional.'));
    if (user) apiRequest<Favorite[]>('/favorites').then(favorites => setIsFavorite(favorites.some(favorite => favorite.professional?.id === params.professionalId))).catch(() => undefined);
  }, [params.professionalId, user?.id]);

  function startRequest(serviceId: string, serviceName: string) {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('RequestForm', { serviceId, serviceName, professionalId: professional?.id });
  }

  async function toggleFavorite() {
    if (!user) { navigation.navigate('Login'); return; }
    const method = isFavorite ? 'DELETE' : 'PUT';
    try { await apiRequest(`/favorites/${params.professionalId}`, { method }); setIsFavorite(!isFavorite); } catch (currentError) { setError(currentError instanceof Error ? currentError.message : 'Não foi possível atualizar os favoritos.'); }
  }

  if (!professional) return <Screen><StateView loading={!error} message={error || 'Carregando profissional...'} /></Screen>;

  const averageRating = professional.metrics?.averageRating;
  return <Screen>
    <View style={styles.hero}><UserAvatar name={professional.name} mediaId={professional.profilePhotoMediaId} size={104} /><Text style={styles.name}>{professional.name}</Text><Text style={styles.location}>{professional.city || 'Cidade não informada'}{professional.state ? `, ${professional.state}` : ''}</Text>{Boolean(professional.bio) && <Text style={styles.bio}>{professional.bio}</Text>}</View>
    <View style={styles.metrics}><View style={styles.metricCard}><Text style={styles.metricValue}>{averageRating ? averageRating.toFixed(1) : 'Novo'}</Text><Text style={styles.metricLabel}>Avaliação</Text></View><View style={styles.metricCard}><Text style={styles.metricValue}>{professional.metrics?.completedServices || 0}</Text><Text style={styles.metricLabel}>Concluídos</Text></View><View style={styles.metricCard}><Text style={styles.metricValue}>{professional.metrics?.verifiedReviewCount || 0}</Text><Text style={styles.metricLabel}>Avaliações</Text></View></View>
    <AppButton label="Ver avaliações" variant="secondary" onPress={() => navigation.navigate('ProfessionalReviews', { professionalId: professional.id, professionalName: professional.name })} />
    <AppButton label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} variant="secondary" onPress={toggleFavorite} />
    <AppButton label="Denunciar perfil" variant="secondary" onPress={() => user ? navigation.navigate('Report', { targetUserId: professional.id }) : navigation.navigate('Login')} />
    <Text style={styles.sectionTitle}>Serviços oferecidos</Text>
    {professional.services.map(service => <View key={service.id} style={styles.card}><Text style={styles.service}>{service.name}</Text><Text style={styles.description}>{service.description || 'Atendimento residencial pela Home Easy.'}</Text><Text style={styles.price}>{service.basePrice ? `A partir de ${formatCurrency(service.basePrice)}` : 'Preço a combinar'}</Text><AppButton label={user ? 'Solicitar orçamento' : 'Entrar para solicitar'} onPress={() => startRequest(service.id, service.name)} /></View>)}
    {Boolean(error) && <StateView message={error} />}
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 8, paddingVertical: 20 }, name: { color: colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center' }, location: { color: colors.textMuted }, bio: { maxWidth: 520, color: colors.textMuted, lineHeight: 21, textAlign: 'center' },
  metrics: { flexDirection: 'row', gap: 8 }, metricCard: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 14, paddingHorizontal: 5, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, metricValue: { color: colors.primary, fontSize: 18, fontWeight: '900' }, metricLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  sectionTitle: { color: colors.text, fontSize: 21, fontWeight: '900' }, card: { padding: 18, gap: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, service: { color: colors.text, fontSize: 20, fontWeight: '800' }, description: { color: colors.textMuted, lineHeight: 21 }, price: { color: colors.primary, fontSize: 17, fontWeight: '800' }
});
