import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Service } from '../types/api';
import { resolveServiceIcon } from '../utils/service-icon';
import { matchesServiceSearch } from '../utils/service-search';

const allCategories = 'Todos';

export function ServicesScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(allCategories);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<Service[]>('/services')
      .then(setServices)
      .catch(currentError => setError(currentError instanceof Error ? currentError.message : 'Não foi possível carregar o catálogo.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [allCategories, ...Array.from(new Set(services.map(service => service.category))).sort()], [services]);
  const filteredServices = useMemo(() => services.filter(service => {
    const matchesCategory = selectedCategory === allCategories || service.category === selectedCategory;
    return matchesCategory && matchesServiceSearch(service.name, searchTerm);
  }), [searchTerm, selectedCategory, services]);

  function clearFilters() { setSearchTerm(''); setSelectedCategory(allCategories); }

  return <Screen>
    <SectionHeader eyebrow="Serviços para sua casa" title="O que você precisa resolver?" description="Busque pelo serviço ou pelo problema e encontre profissionais compatíveis." />
    <View style={styles.searchBox}><Feather name="search" size={20} color={colors.primary} /><TextInput value={searchTerm} onChangeText={setSearchTerm} placeholder="Ex.: vazamento, roupa, pintura" placeholderTextColor={colors.textMuted} style={styles.searchInput} returnKeyType="search" accessibilityLabel="Buscar serviço ou problema" /></View>
    <Pressable style={styles.filterButton} onPress={() => setIsFilterOpen(currentValue => !currentValue)} accessibilityRole="button"><Feather name="sliders" size={18} color={colors.primary} /><Text style={styles.filterButtonText}>{isFilterOpen ? 'Ocultar filtros' : 'Mais filtros'}</Text></Pressable>
    <Pressable style={styles.filterButton} onPress={() => navigation.navigate('RegionalMap')} accessibilityRole="button"><Feather name="map" size={18} color={colors.primary} /><Text style={styles.filterButtonText}>Ver mapa regional</Text></Pressable>
    {isFilterOpen && <View style={styles.filterPanel}><Text style={styles.filterLabel}>Categoria</Text><View style={styles.chips}>{categories.map(category => <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.chip, selectedCategory === category && styles.selectedChip]}><Text style={[styles.chipText, selectedCategory === category && styles.selectedChipText]}>{category}</Text></Pressable>)}</View><Pressable onPress={clearFilters}><Text style={styles.clearText}>Limpar busca e filtros</Text></Pressable></View>}
    {loading && <StateView loading message="Carregando catálogo..." />}
    {Boolean(error) && <StateView message={error} />}
    {!loading && !error && <Text style={styles.resultCount}>{filteredServices.length} serviço(s) encontrado(s)</Text>}
    {!loading && !error && !filteredServices.length && <View style={styles.empty}><Feather name="search" size={28} color={colors.textMuted} /><Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text><Text style={styles.emptyText}>Tente outro termo ou limpe os filtros.</Text><Pressable onPress={clearFilters}><Text style={styles.clearText}>Limpar filtros</Text></Pressable></View>}
    {filteredServices.map(service => <Pressable key={service.id} style={styles.card} onPress={() => navigation.navigate('ServiceProfessionals', { serviceId: service.id, serviceName: service.name })}><View style={styles.icon}><Feather name={resolveServiceIcon(service.name)} size={23} color={colors.primary} /></View><View style={styles.grow}><Text style={styles.name}>{service.name}</Text><Text style={styles.description}>{service.category}</Text></View><Feather name="arrow-right" size={20} color={colors.primary} /></Pressable>)}
  </Screen>;
}

const styles = StyleSheet.create({
  searchBox: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  filterButton: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterButtonText: { color: colors.primary, fontWeight: '800' },
  filterPanel: { gap: 12, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterLabel: { color: colors.text, fontWeight: '800' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textMuted, fontWeight: '700' }, selectedChipText: { color: colors.white },
  clearText: { color: colors.primary, fontWeight: '800' }, resultCount: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', gap: 8, padding: 24, borderRadius: 18, backgroundColor: colors.surface }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' }, emptyText: { color: colors.textMuted, textAlign: 'center' },
  card: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }, grow: { flex: 1, gap: 3 }, name: { color: colors.text, fontSize: 16, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 13 }
});
