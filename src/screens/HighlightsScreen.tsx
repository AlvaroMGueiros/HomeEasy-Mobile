import { Feather } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, apiRequest } from '../api/api-client';
import { HighlightCard } from '../components/professional/HighlightCard';
import { HighlightsFilters } from '../components/professional/HighlightsFilters';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { AppTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Favorite, Service, UserProfile } from '../types/api';
import { Highlight, HighlightLocation, HighlightsResponse } from '../types/highlights';
import { buildHighlightsQuery, mergeHighlights, resolveHighlightLocation } from '../utils/highlights';


export function HighlightsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<AppTabParamList, 'Highlights'>>();
  const [location, setLocation] = useState<HighlightLocation | null>(null);
  const [serviceId, setServiceId] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [favoriteBusyId, setFavoriteBusyId] = useState('');
  const requestVersion = useRef(0);
  const loadingPage = useRef(false);
  const favoriteMutation = useRef(0);
  const favoriteInFlight = useRef(false);

  useEffect(() => {
    let active = true;
    void apiRequest<Service[]>('/services').then(catalog => { if (active) setServices(catalog); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (params?.city && params.state) { setLocation({ city: params.city, state: params.state }); setInitializing(false); return; }
    void apiRequest<UserProfile>('/users/me').then(profile => { if (active) setLocation(resolveHighlightLocation(undefined, profile)); })
      .catch(() => undefined).finally(() => { if (active) setInitializing(false); });
    return () => { active = false; };
  }, [params?.city, params?.state]);

  const loadPage = useCallback(async (requestedPage = 1) => {
    if (!location || (requestedPage > 1 && loadingPage.current)) return;
    const version = requestedPage === 1 ? ++requestVersion.current : requestVersion.current;
    loadingPage.current = true; setLoading(true); setError('');
    if (requestedPage === 1) { setHighlights([]); setHasMore(false); setPage(1); }
    try {
      const response = await apiRequest<HighlightsResponse>(`/highlights?${buildHighlightsQuery(location, serviceId, requestedPage)}`);
      if (version !== requestVersion.current) return;
      setHighlights(current => requestedPage === 1 ? response.highlights : mergeHighlights(current, response.highlights));
      setPage(response.page); setHasMore(response.hasMore);
    } catch (failure) {
      if (version === requestVersion.current) setError(failure instanceof ApiError && failure.status === 404 ? 'Os destaques ainda não estão disponíveis nesta versão do servidor.' : 'Não foi possível carregar os destaques desta região. Tente novamente.');
    } finally { if (version === requestVersion.current) { setLoading(false); loadingPage.current = false; } }
  }, [location?.city, location?.state, serviceId]);

  useFocusEffect(useCallback(() => {
    void loadPage();
    let active = true;
    const version = favoriteMutation.current;
    setFavoritesReady(false);
    void apiRequest<Favorite[]>('/favorites').then(favorites => {
      if (active && version === favoriteMutation.current) { setFavoriteIds(new Set(favorites.map(favorite => favorite.professional?.id || favorite.professionalId || '').filter(Boolean))); setFavoritesReady(true); }
    }).catch(() => undefined);
    return () => { active = false; requestVersion.current += 1; loadingPage.current = false; };
  }, [loadPage]));

  async function toggleFavorite(professionalId: string) {
    if (!favoritesReady || favoriteInFlight.current) return;
    favoriteInFlight.current = true; favoriteMutation.current += 1; setFavoriteBusyId(professionalId);
    const wasFavorite = favoriteIds.has(professionalId);
    try {
      await apiRequest(`/favorites/${professionalId}`, { method: wasFavorite ? 'DELETE' : 'PUT' });
      favoriteMutation.current += 1;
      setFavoritesReady(true);
      setFavoriteIds(current => { const updated = new Set(current); if (wasFavorite) updated.delete(professionalId); else updated.add(professionalId); return updated; });
    } catch (failure) { Alert.alert('Favoritos não atualizados', failure instanceof Error ? failure.message : 'Não foi possível salvar sua escolha.'); }
    finally { favoriteInFlight.current = false; setFavoriteBusyId(''); }
  }

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
    <FlatList<Highlight> data={highlights} keyExtractor={highlight => highlight.id} contentContainerStyle={styles.content}
      renderItem={({ item: highlight }) => <HighlightCard highlight={highlight} isFavorite={favoriteIds.has(highlight.professionalId)} favoriteBusy={!favoritesReady || Boolean(favoriteBusyId)} onFavorite={() => void toggleFavorite(highlight.professionalId)} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshing={loading && page === 1} onRefresh={() => void loadPage()} initialNumToRender={3} maxToRenderPerBatch={3} windowSize={5}
      ListHeaderComponent={<View style={styles.header}>
        <View style={styles.titleRow}><View style={styles.grow}><SectionHeader title="Destaques" /></View><Pressable accessibilityRole="button" accessibilityLabel="Minhas publicações" onPress={() => navigation.navigate('MyHighlights')} style={styles.publish}><Feather name="grid" size={21} color={colors.primary} /></Pressable></View>
        <HighlightsFilters location={location} services={services} serviceId={serviceId} onApply={(nextLocation, nextServiceId) => { setLocation(nextLocation); setServiceId(nextServiceId); }} />
        {Boolean(serviceId) && <AppText style={styles.filterLabel}>{services.find(service => service.id === serviceId)?.name}</AppText>}
        {(initializing || (loading && !highlights.length)) && <StateView loading message="Carregando destaques..." />}
        {Boolean(error) && <StateView title="Destaques indisponíveis" message={error} onAction={() => void loadPage(hasMore ? page + 1 : 1)} />}
      </View>}
      ListEmptyComponent={!loading && !initializing && !error && location ? <View style={styles.empty}><Feather name="star" size={40} color={colors.primary} /><AppText style={styles.emptyTitle}>Ainda não há destaques nesta região</AppText><AppButton label="Publicar meu trabalho" variant="secondary" onPress={() => navigation.navigate('MyHighlights')} /></View> : null}
      ListFooterComponent={hasMore && !error ? <View style={styles.more}><AppButton label="Carregar mais" variant="secondary" loading={loading} onPress={() => void loadPage(page + 1)} /></View> : null} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, content: { padding: 20, paddingBottom: 36 }, header: { gap: 18, marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, grow: { flex: 1 }, publish: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  separator: { height: 22 }, empty: { alignItems: 'center', paddingVertical: 48, gap: 20 }, emptyTitle: { fontSize: 18, color: colors.text, fontWeight: '700', textAlign: 'center' }, more: { paddingTop: 22 }, filterLabel: { color: colors.primary, fontSize: 13, fontWeight: '700' },
});
