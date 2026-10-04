import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { ProfessionalDiscoveryCard } from '../components/professional/ProfessionalDiscoveryCard';
import { ChoiceChips } from '../components/ui/ChoiceChips';
import { MenuRow } from '../components/ui/MenuRow';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Notification, Professional, ProfessionalsResponse, Service, UserProfile } from '../types/api';
import { buildProfessionalRegionMarkers } from '../utils/professional-map';
import { buildRegionalMapHtml, RegionalMapRegion } from '../utils/regional-map-html';
import { resolveLocationLabel } from '../utils/location-label';
import { requestLocationAccess } from '../utils/location-permission';
import { resolveServiceIcon } from '../utils/service-icon';

const brazilRegion: RegionalMapRegion = { latitude: -14.235, longitude: -51.9253, latitudeDelta: 28, longitudeDelta: 28 };
type SheetPosition = 'expanded' | 'default' | 'map';

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { height } = useWindowDimensions();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mapRegion, setMapRegion] = useState(brazilRegion);
  const [mapHtml, setMapHtml] = useState(() => buildRegionalMapHtml(brazilRegion, [], false, true));
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Localização atual');
  const [isExpanded, setIsExpanded] = useState(false);
  const mapHeight = Math.min(Math.max(height * 0.68, 480), 620);
  const defaultSheetTop = Math.min(Math.max(height * 0.46, 360), 430) - 24;
  const mapSheetTop = mapHeight - 18;
  const expandedSheetTop = 24;
  const sheetTop = useRef(new Animated.Value(defaultSheetTop)).current;
  const dragStartTop = useRef(defaultSheetTop);
  const sheetPositionRef = useRef<SheetPosition>('default');

  useEffect(() => {
    const deviceRegionPromise = resolveDeviceRegion();
    void deviceRegionPromise.then(region => {
      if (!region) return;
      setMapRegion(region);
      setMapHtml(buildRegionalMapHtml(region, [], false, true));
    });
    void loadHome(deviceRegionPromise);
  }, [user?.id]);
  useEffect(() => {
    sheetTop.setValue(resolveSheetTop(sheetPositionRef.current));
  }, [defaultSheetTop, expandedSheetTop, mapSheetTop, sheetTop]);

  const sheetPanResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
    onPanResponderGrant: () => { sheetTop.stopAnimation(value => { dragStartTop.current = value; }); },
    onPanResponderMove: (_, gestureState) => {
      const nextTop = Math.min(mapSheetTop, Math.max(expandedSheetTop, dragStartTop.current + gestureState.dy));
      sheetTop.setValue(nextTop);
    },
    onPanResponderRelease: (_, gestureState) => {
      const releasedTop = dragStartTop.current + gestureState.dy;
      animateSheet(resolveSheetPosition(releasedTop, gestureState.vy));
    },
    onPanResponderTerminate: () => animateSheet(sheetPositionRef.current)
  }), [defaultSheetTop, expandedSheetTop, mapSheetTop, sheetTop]);

  function resolveSheetTop(position: SheetPosition) {
    if (position === 'expanded') return expandedSheetTop;
    if (position === 'map') return mapSheetTop;
    return defaultSheetTop;
  }

  function resolveSheetPosition(releasedTop: number, velocityY: number): SheetPosition {
    if (velocityY < -0.35) return 'expanded';
    if (velocityY > 0.35) return 'map';
    const positions: SheetPosition[] = ['expanded', 'default', 'map'];
    let closestPosition = positions[0];
    let closestDistance = Math.abs(releasedTop - resolveSheetTop(closestPosition));
    for (let index = 1; index < positions.length; index += 1) {
      const distance = Math.abs(releasedTop - resolveSheetTop(positions[index]));
      if (distance < closestDistance) {
        closestPosition = positions[index];
        closestDistance = distance;
      }
    }
    return closestPosition;
  }

  function animateSheet(position: SheetPosition) {
    const expanded = position === 'expanded';
    sheetPositionRef.current = position;
    setIsExpanded(expanded);
    Animated.spring(sheetTop, { toValue: resolveSheetTop(position), useNativeDriver: false, damping: 22, stiffness: 220, mass: 0.8 }).start();
  }

  async function loadHome(deviceRegionPromise: Promise<RegionalMapRegion | null>) {
    try {
      const [serviceList, response, currentProfile, notifications] = await Promise.all([
        apiRequest<Service[]>('/services'),
        apiRequest<ProfessionalsResponse>('/professionals?limit=8'),
        apiRequest<UserProfile>('/users/me'),
        apiRequest<Notification[]>('/notifications')
      ]);
      setServices(serviceList);
      setProfile(currentProfile);
      setUnreadCount(notifications.filter(notification => !notification.readAt).length);
      const initialRegion = await resolveInitialRegion(currentProfile, await deviceRegionPromise);
      const visibleProfessionals = await loadProfessionalsForRegion(initialRegion, response.professionals);
      await updateMap(visibleProfessionals, initialRegion);
    } catch {
      Alert.alert('Conteúdo indisponível', 'Não foi possível carregar todas as informações da tela inicial. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function resolveDeviceRegion() {
    try {
      if (await Location.hasServicesEnabledAsync() && await requestLocationAccess()) {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const region = createNearbyRegion(location.coords.latitude, location.coords.longitude);
        try {
          await updateLocationLabel(location.coords.latitude, location.coords.longitude);
        } catch {
          setLocationLabel('Localização atual');
        }
        return region;
      }
    } catch {
      return null;
    }
    return null;
  }

  async function resolveInitialRegion(currentProfile: UserProfile, deviceRegion: RegionalMapRegion | null) {
    if (deviceRegion) return deviceRegion;
    if (currentProfile.city && currentProfile.state) {
      setLocationLabel(`${currentProfile.city}, ${currentProfile.state}`);
      const locations = await Location.geocodeAsync(`${currentProfile.city}, ${currentProfile.state}, Brasil`);
      if (locations[0]) return createNearbyRegion(locations[0].latitude, locations[0].longitude);
    }
    return brazilRegion;
  }

  async function updateMap(visibleProfessionals: Professional[], region: RegionalMapRegion) {
    const markers = await buildProfessionalRegionMarkers(visibleProfessionals);
    setProfessionals(visibleProfessionals);
    setMapRegion(region);
    setMapHtml(buildRegionalMapHtml(region, markers.map(marker => ({
      key: marker.key,
      city: marker.city,
      state: marker.state,
      latitude: marker.latitude,
      longitude: marker.longitude,
      professionalCount: marker.professionals.length
    })), false, true));
  }

  async function loadProfessionalsForRegion(region: RegionalMapRegion, fallbackProfessionals: Professional[]) {
    if (region === brazilRegion) return fallbackProfessionals;
    try {
      const query = new URLSearchParams({ latitude: String(region.latitude), longitude: String(region.longitude), radiusKm: '50', limit: '8' });
      const response = await apiRequest<ProfessionalsResponse>(`/professionals?${query.toString()}`);
      return response.professionals;
    } catch {
      return fallbackProfessionals;
    }
  }

  async function centerOnUser() {
    setLocating(true);
    try {
      if (!await Location.hasServicesEnabledAsync()) {
        Alert.alert('Localização desativada', 'Ative a localização do aparelho para encontrar profissionais próximos.');
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão necessária', 'Permita o acesso à localização para encontrar profissionais próximos.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      await updateLocationLabel(location.coords.latitude, location.coords.longitude);
      const query = new URLSearchParams({ latitude: String(location.coords.latitude), longitude: String(location.coords.longitude), radiusKm: '50', limit: '8' });
      const response = await apiRequest<ProfessionalsResponse>(`/professionals?${query.toString()}`);
      await updateMap(response.professionals, createNearbyRegion(location.coords.latitude, location.coords.longitude));
    } catch {
      Alert.alert('Localização indisponível', 'Não foi possível atualizar os profissionais próximos. Tente novamente.');
    } finally {
      setLocating(false);
    }
  }

  async function updateLocationLabel(latitude: number, longitude: number) {
    const resolvedLabel = await resolveLocationLabel(latitude, longitude);
    setLocationLabel(resolvedLabel || 'Localização atual');
  }

  function handleExploreProfessionals() {
    const [cityPart, statePart] = locationLabel.split(',').map(s => s.trim());
    if (!cityPart || !statePart) {
      navigation.navigate('RegionalMap');
      return;
    }
    navigation.navigate('CityProfessionals', {
      city: cityPart,
      state: statePart
    });
  }

  const firstName = (profile?.name || user?.name || 'Cliente').split(' ')[0];
  return <View style={styles.root}>
    <View style={[styles.mapContainer, { height: mapHeight }]}>
      <WebView
        key={`${mapRegion.latitude}-${mapRegion.longitude}-${professionals.length}`}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        javaScriptEnabled
        scrollEnabled
        nestedScrollEnabled
        overScrollMode="never"
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'SELECT_CITY' && data.city) {
              navigation.navigate('CityProfessionals', {
                city: data.city,
                state: data.state || 'PE'
              });
            }
          } catch {
            // ignora
          }
        }}
        style={styles.map}
      />
      <Pressable style={styles.locationPill} onPress={centerOnUser} disabled={locating} accessibilityRole="button"><Feather name="map-pin" size={20} color={colors.primary} /><Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text><Feather name="chevron-down" size={18} color={colors.primary} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir notificações" onPress={() => navigation.navigate('Notifications')} style={styles.notificationButton}><Feather name="bell" size={21} color={colors.text} />{unreadCount > 0 && <View style={styles.notificationDot} />}</Pressable>
      <Pressable style={styles.targetButton} onPress={centerOnUser} disabled={locating} accessibilityRole="button" accessibilityLabel="Usar minha localização"><Feather name={locating ? 'loader' : 'crosshair'} size={21} color={colors.text} /></Pressable>
      <Animated.View style={[styles.exploreButtonContainer, { top: Animated.subtract(sheetTop, 76) }]}>
        <Pressable style={styles.exploreButton} onPress={handleExploreProfessionals} accessibilityRole="button"><Feather name="list" size={22} color={colors.text} /><View><Text style={styles.exploreTitle}>Ver profissionais</Text><Text style={styles.exploreText}>{professionals.length} nesta área</Text></View></Pressable>
      </Animated.View>
    </View>
    <Animated.View style={[styles.sheet, { top: sheetTop }]}>
      <View style={styles.dragArea} {...sheetPanResponder.panHandlers}><View style={styles.dragHandle} /></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
        <ChoiceChips value={isExpanded ? 'list' : 'map'} options={[{ value: 'map', label: 'Mapa' }, { value: 'list', label: 'Lista' }]} onChange={viewMode => animateSheet(viewMode === 'list' ? 'expanded' : 'default')} />
        {isExpanded && <Pressable style={styles.backToMapButton} onPress={() => animateSheet('default')} accessibilityRole="button"><Feather name="map" size={18} color={colors.primary} /><Text style={styles.backToMapText}>Voltar para o mapa</Text></Pressable>}
        <Text style={styles.greeting}>Olá, {firstName}!</Text><Text style={styles.question}>Como podemos te ajudar hoje?</Text>
        <Pressable style={styles.search} onPress={() => navigation.navigate('Services')} accessibilityRole="button"><Feather name="search" size={22} color={colors.text} /><Text style={styles.searchText}>Buscar serviço ou profissional</Text></Pressable>
        {loading && <Text style={styles.loadingText}>Preparando sua região...</Text>}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Serviços para sua casa</Text><Pressable accessibilityRole="button" style={styles.seeAllButton} onPress={() => navigation.navigate('Services')}><Text style={styles.seeAll}>Ver todos</Text><Feather name="chevron-right" size={18} color={colors.primary} /></Pressable></View>
        <View style={styles.categoryGrid}>{services.slice(0, 6).map(service => <Pressable key={service.id} style={styles.category} onPress={() => navigation.navigate('ServiceProfessionals', { serviceId: service.id, serviceName: service.name })}><Feather name={resolveServiceIcon(service.name)} size={23} color={colors.primary} /><Text style={styles.categoryName} numberOfLines={2}>{service.name}</Text></Pressable>)}</View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profissionais recomendados</Text>
          <Pressable style={styles.seeAllButton} onPress={handleExploreProfessionals}>
            <Text style={styles.seeAll}>Ver todos</Text>
            <Feather name="chevron-right" size={18} color={colors.primary} />
          </Pressable>
        </View>
        {!loading && !professionals.length && <StateView message="Nenhum profissional encontrado nesta região. Explore o mapa ou escolha um serviço." />}
        {isExpanded ? <View style={styles.verticalList}>
          {professionals.map(professional => <ProfessionalDiscoveryCard key={professional.id} professional={professional} expanded onPress={() => navigation.navigate('Professional', { professionalId: professional.id })} />)}
        </View> : <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList} contentContainerStyle={styles.horizontalContent}>
          {professionals.slice(0, 6).map(professional => <ProfessionalDiscoveryCard key={professional.id} professional={professional} expanded={false} onPress={() => navigation.navigate('Professional', { professionalId: professional.id })} />)}
        </ScrollView>}
        <View style={styles.shortcut}><MenuRow icon="file-text" title="Precisa de um orçamento?" description="Escolha o serviço e conte o que você precisa." onPress={() => navigation.navigate('Services')} /></View>
      </ScrollView>
    </Animated.View>
  </View>;
}

function createNearbyRegion(latitude: number, longitude: number): RegionalMapRegion {
  return { latitude, longitude, latitudeDelta: 0.7, longitudeDelta: 0.7 };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  mapContainer: { overflow: 'hidden', backgroundColor: colors.background },
  map: { flex: 1, backgroundColor: colors.background },
  locationPill: {
    position: 'absolute',
    top: 38,
    left: 20,
    maxWidth: '60%',
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 25,
    backgroundColor: colors.surface,
    elevation: 5,
    shadowColor: colors.text,
    shadowOpacity: 0.14,
    shadowRadius: 9
  },
  locationText: { flexShrink: 1, color: colors.text, fontSize: 15, fontWeight: '900' },
  notificationButton: {
    position: 'absolute',
    top: 38,
    right: 20,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: colors.surface,
    elevation: 5,
    shadowColor: colors.text,
    shadowOpacity: 0.14,
    shadowRadius: 9
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger
  },
  targetButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: colors.surface,
    elevation: 5,
    shadowColor: colors.text,
    shadowOpacity: 0.14,
    shadowRadius: 9
  },
  exploreButtonContainer: {
    position: 'absolute',
    right: 20,
  },
  exploreButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 17,
    borderRadius: 29,
    backgroundColor: colors.surface,
    elevation: 5,
    shadowColor: colors.text,
    shadowOpacity: 0.14,
    shadowRadius: 9
  },
  exploreTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  exploreText: { color: colors.textMuted, fontSize: 11 },
  sheet: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: colors.text,
    shadowOpacity: 0.1,
    shadowRadius: 12
  },
  dragArea: { minHeight: 34, alignItems: 'center', justifyContent: 'center' },
  dragHandle: { width: 52, height: 5, borderRadius: 3, backgroundColor: colors.border },
  sheetContent: { gap: 14, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 36 },
  backToMapButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  backToMapText: { color: colors.primary, fontWeight: '800' },
  greeting: { color: colors.textMuted, fontSize: 15 },
  question: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '900' },
  search: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  searchText: { flex: 1, color: colors.textMuted, fontSize: 15 },
  loadingText: { color: colors.textMuted, fontSize: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  category: {
    width: '31%',
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: 8,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  categoryName: { color: colors.text, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '900' },
  seeAllButton: { flexDirection: 'row', alignItems: 'center' },
  seeAll: { color: colors.primary, fontWeight: '800' },
  horizontalList: { flexGrow: 0 },
  horizontalContent: { gap: 10, paddingRight: 4 },
  verticalList: { gap: 10, marginTop: 2 },
  shortcut: { borderRadius: 17, overflow: 'hidden', backgroundColor: colors.primarySoft }
});
