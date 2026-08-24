import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { apiRequest } from '../api/api-client';
import { Screen } from '../components/ui/Screen';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Professional, ProfessionalsResponse } from '../types/api';

interface RegionMarker { key: string; city: string; state: string; latitude: number; longitude: number; professionals: Professional[]; }
const brazilRegion: Region = { latitude: -14.235, longitude: -51.9253, latitudeDelta: 28, longitudeDelta: 28 };
async function buildRegionMarkers(professionals: Professional[]) { const grouped = new Map<string, Professional[]>(); for (const professional of professionals) { if (!professional.city || !professional.state) continue; const key = `${professional.city}|${professional.state}`; grouped.set(key, [...(grouped.get(key) || []), professional]); } const markers: RegionMarker[] = []; for (const [key, groupedProfessionals] of grouped) { const first = groupedProfessionals[0]; const locations = await Location.geocodeAsync(`${first.city}, ${first.state}, Brasil`); if (locations[0]) markers.push({ key, city: first.city || '', state: first.state || '', latitude: locations[0].latitude, longitude: locations[0].longitude, professionals: groupedProfessionals }); } return markers; }

export function RegionalMapScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [mapRegion, setMapRegion] = useState(brazilRegion);
  const [markers, setMarkers] = useState<RegionMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);

  useEffect(() => { loadMap(); }, []);

  async function loadMap() {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Permita o acesso à localização para montar o mapa regional.');
      const response = await apiRequest<ProfessionalsResponse>('/professionals?limit=50');
      setMarkers(await buildRegionMarkers(response.professionals));
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Não foi possível montar o mapa regional.');
    } finally { setLoading(false); }
  }

  async function centerOnUser() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) { setError('Permita o acesso à localização para visualizar profissionais próximos.'); return; }
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setMapRegion({ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 1.2, longitudeDelta: 1.2 });
    const query = new URLSearchParams({ latitude: String(location.coords.latitude), longitude: String(location.coords.longitude), radiusKm: String(radiusKm), limit: '50' });
    const response = await apiRequest<ProfessionalsResponse>(`/professionals?${query.toString()}`);
    setMarkers(await buildRegionMarkers(response.professionals));
  }

  return <Screen>
    <SectionHeader eyebrow="Profissionais perto de você" title="Explore por região" description="Veja onde existem profissionais cadastrados e abra seus perfis." />
    <ChoiceChips value={radiusKm} onChange={setRadiusKm} options={[{ value: 10, label: '10 km' }, { value: 25, label: '25 km' }, { value: 50, label: '50 km' }, { value: 100, label: '100 km' }]} />
    <Pressable style={styles.locationButton} onPress={centerOnUser}><Feather name="navigation" size={18} color={colors.primary} /><Text style={styles.locationLabel}>Usar minha localização</Text></Pressable>
    {loading && <StateView loading message="Preparando mapa..." />}{Boolean(error) && <StateView message={error} />}
    {!loading && <MapView style={styles.map} region={mapRegion} onRegionChangeComplete={setMapRegion}><Marker coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }} pinColor={colors.accent} title="Centro da busca" />{markers.map(marker => <Marker key={marker.key} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }} title={`${marker.city}, ${marker.state}`} description={`${marker.professionals.length} profissional(is)`} />)}</MapView>}
    {markers.map(marker => <View key={marker.key} style={styles.card}><View style={styles.grow}><Text style={styles.city}>{marker.city}, {marker.state}</Text><Text style={styles.meta}>{marker.professionals.length} profissional(is)</Text></View><Pressable onPress={() => navigation.navigate('Professional', { professionalId: marker.professionals[0].id })}><Text style={styles.link}>Ver perfil</Text></Pressable></View>)}
  </Screen>;
}

const styles = StyleSheet.create({ locationButton: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, locationLabel: { color: colors.primary, fontWeight: '800' }, map: { width: '100%', height: 360, borderRadius: 20 }, card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, grow: { flex: 1 }, city: { color: colors.text, fontWeight: '800' }, meta: { color: colors.textMuted, fontSize: 12 }, link: { color: colors.primary, fontWeight: '800' } });
