import { Feather } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { AppButton } from '../components/ui/AppButton';
import { useAuth } from '../auth/AuthContext';
import { UserAvatar } from '../components/ui/UserAvatar';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Professional, ProfessionalsResponse } from '../types/api';
import { formatCurrency } from '../utils/currency';
import { parseOptionalNumber } from '../utils/number';
import { normalizeSearchText } from '../utils/service-search';

export function ServiceProfessionalsScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'ServiceProfessionals'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [minimumRating, setMinimumRating] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = new URLSearchParams({ serviceId: params.serviceId, limit: '50' });
    apiRequest<ProfessionalsResponse>(`/professionals?${query.toString()}`)
      .then(response => setProfessionals(response.professionals.filter(professional => professional.id !== user?.id)))
      .catch(currentError => setError(currentError instanceof Error ? currentError.message : 'Não foi possível carregar os profissionais.'))
      .finally(() => setLoading(false));
  }, [params.serviceId, user?.id]);

  const cities = useMemo(() => Array.from(new Set(professionals.map(professional => professional.city).filter((city): city is string => Boolean(city)))).sort(), [professionals]);
  const parsedMinimumPrice = parseOptionalNumber(minimumPrice);
  const parsedMaximumPrice = parseOptionalNumber(maximumPrice);
  const hasInvalidPriceRange = parsedMinimumPrice !== undefined && parsedMaximumPrice !== undefined && parsedMinimumPrice > parsedMaximumPrice;
  const filteredProfessionals = useMemo(() => {
    const normalizedSearchTerm = normalizeSearchText(searchTerm);
    if (hasInvalidPriceRange) return [];
    return professionals.filter(professional => {
      const service = professional.services.find(currentService => currentService.id === params.serviceId);
      const matchesSearch = !normalizedSearchTerm || normalizeSearchText(`${professional.name} ${professional.city || ''} ${professional.state || ''}`).includes(normalizedSearchTerm);
      const matchesCity = !selectedCity || professional.city === selectedCity;
      const matchesMinimumPrice = parsedMinimumPrice === undefined || (service?.basePrice !== null && service?.basePrice !== undefined && service.basePrice >= parsedMinimumPrice);
      const matchesMaximumPrice = parsedMaximumPrice === undefined || (service?.basePrice !== null && service?.basePrice !== undefined && service.basePrice <= parsedMaximumPrice);
      const matchesRating = minimumRating === 0 || (professional.metrics?.averageRating !== null && professional.metrics?.averageRating !== undefined && professional.metrics.averageRating >= minimumRating);
      return matchesSearch && matchesCity && matchesMinimumPrice && matchesMaximumPrice && matchesRating;
    });
  }, [hasInvalidPriceRange, minimumRating, params.serviceId, parsedMaximumPrice, parsedMinimumPrice, professionals, searchTerm, selectedCity]);

  function clearFilters() { setSearchTerm(''); setSelectedCity(''); setMinimumPrice(''); setMaximumPrice(''); setMinimumRating(0); }

  return <Screen>
    <SectionHeader eyebrow="Profissionais disponíveis" title={params.serviceName} description="Compare localização, preço e reputação antes de escolher." />
    <AppButton label={user ? 'Criar solicitação aberta' : 'Entrar para solicitar'} onPress={() => user ? navigation.navigate('RequestForm', { serviceId: params.serviceId, serviceName: params.serviceName }) : navigation.navigate('Login')} />
    <View style={styles.searchBox}><Feather name="search" size={20} color={colors.primary} /><TextInput value={searchTerm} onChangeText={setSearchTerm} placeholder="Buscar por nome ou cidade" placeholderTextColor={colors.textMuted} style={styles.searchInput} accessibilityLabel="Buscar profissional" /></View>
    <Pressable style={styles.filterButton} onPress={() => setIsFilterOpen(currentValue => !currentValue)}><Feather name="sliders" size={18} color={colors.primary} /><Text style={styles.filterButtonText}>{isFilterOpen ? 'Ocultar filtros' : 'Mais filtros'}</Text></Pressable>
    {isFilterOpen && <View style={styles.filterPanel}>
      <Text style={styles.filterLabel}>Cidade</Text><View style={styles.chips}><Pressable onPress={() => setSelectedCity('')} style={[styles.chip, !selectedCity && styles.selectedChip]}><Text style={[styles.chipText, !selectedCity && styles.selectedChipText]}>Todas</Text></Pressable>{cities.map(city => <Pressable key={city} onPress={() => setSelectedCity(city)} style={[styles.chip, selectedCity === city && styles.selectedChip]}><Text style={[styles.chipText, selectedCity === city && styles.selectedChipText]}>{city}</Text></Pressable>)}</View>
      <Text style={styles.filterLabel}>Faixa de preço</Text><View style={styles.priceFields}><TextInput value={minimumPrice} onChangeText={setMinimumPrice} keyboardType="decimal-pad" placeholder="Mínimo" placeholderTextColor={colors.textMuted} style={styles.priceInput} /><TextInput value={maximumPrice} onChangeText={setMaximumPrice} keyboardType="decimal-pad" placeholder="Máximo" placeholderTextColor={colors.textMuted} style={styles.priceInput} /></View>
      <Text style={styles.filterLabel}>Avaliação mínima</Text><View style={styles.chips}>{[0, 3, 4, 4.5].map(rating => <Pressable key={rating} onPress={() => setMinimumRating(rating)} style={[styles.chip, minimumRating === rating && styles.selectedChip]}><Text style={[styles.chipText, minimumRating === rating && styles.selectedChipText]}>{rating ? `${rating}+` : 'Qualquer'}</Text></Pressable>)}</View>
      <Pressable onPress={clearFilters}><Text style={styles.clearText}>Limpar filtros</Text></Pressable>
    </View>}
    {hasInvalidPriceRange && <Text style={styles.filterError}>O preço mínimo deve ser menor ou igual ao máximo.</Text>}
    {loading && <StateView loading message="Buscando profissionais..." />}
    {Boolean(error) && <StateView message={error} />}
    {!loading && !error && !hasInvalidPriceRange && <Text style={styles.resultCount}>{filteredProfessionals.length} profissional(is) encontrado(s)</Text>}
    {!loading && !error && !hasInvalidPriceRange && !filteredProfessionals.length && <View style={styles.empty}><Feather name="users" size={30} color={colors.textMuted} /><Text style={styles.emptyTitle}>Nenhum profissional disponível</Text><Text style={styles.emptyText}>Tente buscar outra cidade ou volte ao catálogo para escolher outro serviço.</Text></View>}
    {filteredProfessionals.map(professional => {
      const service = professional.services.find(currentService => currentService.id === params.serviceId);
      return <Pressable key={professional.id} style={styles.card} onPress={() => navigation.navigate('Professional', { professionalId: professional.id })}>
        <View style={styles.header}><UserAvatar name={professional.name} mediaId={professional.profilePhotoMediaId} size={58} /><View style={styles.grow}><Text style={styles.name}>{professional.name}</Text><Text style={styles.location}>{professional.city || 'Cidade não informada'}{professional.state ? `, ${professional.state}` : ''}</Text></View><Feather name="chevron-right" size={21} color={colors.primary} /></View>
        <View style={styles.details}><Text style={styles.rating}>{professional.metrics?.averageRating ? `★ ${professional.metrics.averageRating.toFixed(1)}` : 'Novo profissional'}</Text><Text style={styles.price}>{service?.basePrice ? `A partir de ${formatCurrency(service.basePrice)}` : 'Preço a combinar'}</Text></View>
      </Pressable>;
    })}
  </Screen>;
}

const styles = StyleSheet.create({
  searchBox: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 }, resultCount: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  filterButton: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, filterButtonText: { color: colors.primary, fontWeight: '800' },
  filterPanel: { gap: 12, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, filterLabel: { color: colors.text, fontWeight: '800' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textMuted, fontWeight: '700' }, selectedChipText: { color: colors.white },
  priceFields: { flexDirection: 'row', gap: 10 }, priceInput: { flex: 1, minHeight: 48, paddingHorizontal: 14, borderRadius: 14, color: colors.text, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, clearText: { color: colors.primary, fontWeight: '800' },
  filterError: { color: colors.danger, fontWeight: '700' },
  card: { gap: 14, padding: 16, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, grow: { flex: 1, gap: 3 },
  name: { color: colors.text, fontSize: 17, fontWeight: '800' }, location: { color: colors.textMuted, fontSize: 13 }, details: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  rating: { color: colors.warning, fontWeight: '800' }, price: { flex: 1, color: colors.primary, fontWeight: '800', textAlign: 'right' },
  empty: { alignItems: 'center', gap: 8, padding: 26, borderRadius: 18, backgroundColor: colors.surface }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' }, emptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 }
});
