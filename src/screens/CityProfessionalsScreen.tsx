import { Feather } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { UserAvatar } from '../components/ui/UserAvatar';
import { ProfessionalReputation } from '../components/professional/ProfessionalReputation';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Professional, ProfessionalsResponse } from '../types/api';
import { normalizeSearchText } from '../utils/service-search';

const allCategories = 'Todas';

export function CityProfessionalsScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'CityProfessionals'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(allCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = new URLSearchParams({ city: params.city, state: params.state, limit: '50' });
    apiRequest<ProfessionalsResponse>(`/professionals?${query.toString()}`)
      .then(response => setProfessionals(response.professionals))
      .catch(() => setError('Não foi possível carregar os profissionais desta cidade.'))
      .finally(() => setLoading(false));
  }, [params.city, params.state]);

  const categories = useMemo(() => [allCategories, ...Array.from(new Set(professionals.flatMap(professional => professional.services.map(service => service.category)))).sort()], [professionals]);
  const filteredProfessionals = useMemo(() => {
    const normalizedSearchTerm = normalizeSearchText(searchTerm);
    return professionals.filter(professional => {
      const matchesName = !normalizedSearchTerm || normalizeSearchText(professional.name).includes(normalizedSearchTerm);
      const matchesCategory = selectedCategory === allCategories || professional.services.some(service => service.category === selectedCategory);
      return matchesName && matchesCategory;
    });
  }, [professionals, searchTerm, selectedCategory]);

  return <Screen>
    <SectionHeader eyebrow="Profissionais da cidade" title={`${params.city}, ${params.state}`} description="Busque pelo nome ou filtre pela categoria de serviço." />
    <View style={styles.searchBox}><Feather name="search" size={20} color={colors.primary} /><TextInput value={searchTerm} onChangeText={setSearchTerm} placeholder="Buscar profissional pelo nome" placeholderTextColor={colors.textMuted} style={styles.searchInput} returnKeyType="search" accessibilityLabel="Buscar profissional pelo nome" /></View>
    <Text style={styles.filterLabel}>Categorias</Text>
    <View style={styles.chips}>{categories.map(category => <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.chip, selectedCategory === category && styles.selectedChip]}><Text style={[styles.chipText, selectedCategory === category && styles.selectedChipText]}>{category}</Text></Pressable>)}</View>
    {loading && <StateView loading message="Buscando profissionais..." />}
    {Boolean(error) && <StateView message={error} />}
    {!loading && !error && <Text style={styles.resultCount}>{filteredProfessionals.length} profissional(is) encontrado(s)</Text>}
    {!loading && !error && !filteredProfessionals.length && <View style={styles.empty}><Feather name="users" size={30} color={colors.textMuted} /><Text style={styles.emptyTitle}>Nenhum profissional encontrado</Text><Text style={styles.emptyText}>Tente outro nome ou selecione uma categoria diferente.</Text></View>}
    {filteredProfessionals.map(professional => <Pressable key={professional.id} style={styles.card} onPress={() => navigation.navigate('Professional', { professionalId: professional.id })}>
      <UserAvatar name={professional.name} mediaId={professional.profilePhotoMediaId} size={58} />
      <View style={styles.grow}><Text style={styles.name}>{professional.name}</Text><Text style={styles.services}>{professional.services.map(service => service.name).join(', ') || 'Serviços não informados'}</Text><ProfessionalReputation professional={professional} compact /></View>
      <Feather name="chevron-right" size={21} color={colors.primary} />
    </Pressable>)}
  </Screen>;
}

const styles = StyleSheet.create({
  searchBox: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 }, filterLabel: { color: colors.text, fontWeight: '800' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textMuted, fontWeight: '700' }, selectedChipText: { color: colors.white },
  resultCount: { color: colors.textMuted, fontSize: 13, fontWeight: '700' }, card: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  grow: { flex: 1, gap: 4 }, name: { color: colors.text, fontSize: 17, fontWeight: '800' }, services: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  empty: { alignItems: 'center', gap: 8, padding: 26, borderRadius: 18, backgroundColor: colors.surface }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' }, emptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 }
});
