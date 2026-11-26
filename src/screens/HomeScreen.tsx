import { AppIcon } from '../components/ui/AppIcon';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BlurTargetView } from 'expo-blur';
import { AccessibilityInfo, Alert, Animated, Modal, PanResponder, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '../components/ui/Pressable';

import { AppText as Text } from '../components/ui/AppText';
import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { RegionalMap } from '../components/RegionalMap';
import { HighlightsPreview } from '../components/professional/HighlightsPreview';
import { resolveHighlightLocation } from '../utils/highlights';
import { ProfessionalDiscoveryCard } from '../components/professional/ProfessionalDiscoveryCard';
import { MenuRow } from '../components/ui/MenuRow';
import { AppButton } from '../components/ui/AppButton';
import { AppTextInput } from '../components/ui/AppTextInput';
import { GlassSurface } from '../components/ui/GlassSurface';
import { useTabBarClearance } from '../navigation/tabBar';
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
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [cityError, setCityError] = useState('');
  const [searchingCity, setSearchingCity] = useState(false);
  const mapBlurTarget = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const tabBarClearance = useTabBarClearance();
  const [locationLabel, setLocationLabel] = useState('Localização atual');
  const highlightLocation = resolveHighlightLocation(locationLabel, profile);
  const [isExpanded, setIsExpanded] = useState(false);
  const mapHeight = Math.min(Math.max(height * 0.68, 480), 620);
  const defaultSheetTop = Math.min(Math.max(height * 0.46, 360), 430) - 24;
  const mapSheetTop = mapHeight - 18;
  const expandedSheetTop = 24;
  const sheetTop = useRef(new Animated.Value(defaultSheetTop)).current;
  const dragStartTop = useRef(defaultSheetTop);
  const sheetPositionRef = useRef<SheetPosition>('default');
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { reduceMotionRef.current = value; });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { reduceMotionRef.current = value; }).catch(() => undefined);
    return () => subscription.remove();
  }, []);

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
    if (reduceMotionRef.current) { sheetTop.setValue(resolveSheetTop(position)); return; }
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
      const granted = await requestLocationAccess(true);
      if (!granted) {
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

  async function searchCity() {
    const query = cityQuery.trim();
    if (query.length < 3) { setCityError('Digite o nome da cidade.'); return; }
    setSearchingCity(true);
    setCityError('');
    try {
      const [place] = await Location.geocodeAsync(`${query}, Brasil`);
      if (!place) { setCityError('Não encontramos essa cidade. Confira o nome e tente de novo.'); return; }
      const region = createNearbyRegion(place.latitude, place.longitude);
      await updateLocationLabel(place.latitude, place.longitude);
      await updateMap(await loadProfessionalsForRegion(region, []), region);
      setCityPickerVisible(false);
      setCityQuery('');
    } catch {
      setCityError('Não foi possível buscar essa cidade agora. Tente novamente.');
    } finally {
      setSearchingCity(false);
    }
  }

  function selectCurrentLocation() {
    setCityPickerVisible(false);
    void centerOnUser();
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
      <BlurTargetView ref={mapBlurTarget} style={StyleSheet.absoluteFill}>
        <RegionalMap html={mapHtml} onSelectCity={(city, state) => navigation.navigate('CityProfessionals', { city, state })} />
      </BlurTargetView>
      <View style={[styles.mapOverlay, { top: insets.top + 12 }]} pointerEvents="box-none">
        <GlassSurface radius={22} blurTarget={mapBlurTarget} style={styles.searchCard}>
          <Pressable feedback="opacity" accessibilityLabel="Buscar serviço ou profissional" onPress={() => navigation.navigate('Services')} style={styles.searchRow}>
            <View style={styles.searchIconBox}><AppIcon name="search" size={20} color={colors.white} weight="bold" /></View>
            <Text style={styles.searchPlaceholder} numberOfLines={1}>Qual serviço você precisa?</Text>
          </Pressable>
          <View style={styles.cityRow}>
            <AppIcon name="map-pin" size={16} color={colors.primary} />
            <Text style={styles.cityText} numberOfLines={1}>{locating ? 'Localizando…' : locationLabel}</Text>
            <Pressable feedback="opacity" accessibilityLabel="Alterar cidade" hitSlop={10} onPress={() => { setCityError(''); setCityPickerVisible(true); }} style={styles.changeChip}><Text style={styles.changeText}>Alterar</Text></Pressable>
          </View>
        </GlassSurface>
        <GlassSurface radius={24} blurTarget={mapBlurTarget}>
          <Pressable feedback="opacity" accessibilityLabel="Abrir notificações" onPress={() => navigation.navigate('Notifications')} style={styles.notificationButton}><AppIcon name="bell" size={21} color={colors.text} />{unreadCount > 0 && <View style={styles.notificationDot} />}</Pressable>
        </GlassSurface>
      </View>
      <Animated.View style={[styles.exploreButtonContainer, { top: Animated.subtract(sheetTop, 76) }]}>
        <Pressable style={styles.exploreButton} onPress={handleExploreProfessionals} accessibilityRole="button"><AppIcon name="list" size={22} color={colors.text} /><View><Text style={styles.exploreTitle}>Ver profissionais</Text><Text style={styles.exploreText}>{professionals.length} nesta área</Text></View></Pressable>
      </Animated.View>
    </View>
    <Animated.View style={[styles.sheet, { top: sheetTop }]}>
      <View style={styles.dragArea} {...sheetPanResponder.panHandlers}><View style={styles.dragHandle} /></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.sheetContent, { paddingBottom: tabBarClearance }]}>
        {isExpanded && <Pressable style={styles.backToMapButton} onPress={() => animateSheet('default')} accessibilityRole="button"><AppIcon name="map" size={18} color={colors.primary} /><Text style={styles.backToMapText}>Voltar para o mapa</Text></Pressable>}
        <Text style={styles.greeting}>Olá, {firstName}</Text><Text style={styles.question}>Como podemos te ajudar hoje?</Text>
        {loading && <Text style={styles.loadingText}>Preparando sua região...</Text>}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Serviços para sua casa</Text><Pressable accessibilityRole="button" style={styles.seeAllButton} onPress={() => navigation.navigate('Services')}><Text style={styles.seeAll}>Ver todos</Text><AppIcon name="chevron-right" size={18} color={colors.primary} /></Pressable></View>
        <View style={styles.categoryGrid}>{services.slice(0, 6).map(service => <Pressable key={service.id} style={styles.category} onPress={() => navigation.navigate('ServiceProfessionals', { serviceId: service.id, serviceName: service.name })}><AppIcon weight="duotone" name={resolveServiceIcon(service.name)} size={23} color={colors.primary} /><Text style={styles.categoryName} numberOfLines={2}>{service.name.replace(/-/g, '‑')}</Text></Pressable>)}</View>
        <HighlightsPreview city={highlightLocation?.city} state={highlightLocation?.state} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profissionais recomendados</Text>
          <Pressable style={styles.seeAllButton} onPress={handleExploreProfessionals}>
            <Text style={styles.seeAll}>Ver todos</Text>
            <AppIcon name="chevron-right" size={18} color={colors.primary} />
          </Pressable>
        </View>
        {!loading && !professionals.length && <StateView icon="map-pin" title="Ainda não há profissionais aqui" message="Faça um pedido de orçamento aberto à região. Os profissionais que atendem aqui poderão responder." actionLabel="Pedir orçamento" onAction={() => navigation.navigate('Services')} />}
        {isExpanded ? <View style={styles.verticalList}>
          {professionals.map(professional => <ProfessionalDiscoveryCard key={professional.id} professional={professional} expanded onPress={() => navigation.navigate('Professional', { professionalId: professional.id })} />)}
        </View> : <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList} contentContainerStyle={styles.horizontalContent}>
          {professionals.slice(0, 6).map(professional => <ProfessionalDiscoveryCard key={professional.id} professional={professional} expanded={false} onPress={() => navigation.navigate('Professional', { professionalId: professional.id })} />)}
        </ScrollView>}
        <View style={styles.shortcut}><MenuRow icon="file-text" title="Precisa de um orçamento?" onPress={() => navigation.navigate('Services')} /></View>
        <View style={styles.shortcut}><MenuRow icon="briefcase" title="Quer oferecer seus serviços?" onPress={() => navigation.navigate('ProfessionalManager')} /></View>
      </ScrollView>
    </Animated.View>
    <Modal visible={cityPickerVisible} transparent animationType="fade" onRequestClose={() => setCityPickerVisible(false)}>
      <View style={styles.pickerBackdrop}>
        <Pressable feedback="none" accessibilityLabel="Fechar" style={StyleSheet.absoluteFill} onPress={() => setCityPickerVisible(false)} />
        <View accessibilityViewIsModal style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <Text accessibilityRole="header" style={styles.pickerTitle}>Escolher cidade</Text>
          <AppTextInput value={cityQuery} onChangeText={setCityQuery} placeholder="Ex.: Caruaru, PE" placeholderTextColor={colors.textMuted} autoFocus autoCapitalize="words" autoComplete="postal-address-locality" returnKeyType="search" onSubmitEditing={() => void searchCity()} style={styles.pickerInput} accessibilityLabel="Cidade" />
          {Boolean(cityError) && <Text style={styles.pickerError} accessibilityLiveRegion="polite">{cityError}</Text>}
          <AppButton label="Buscar cidade" loading={searchingCity} onPress={() => void searchCity()} />
          <Pressable feedback="opacity" onPress={selectCurrentLocation} style={styles.pickerLocation}><AppIcon name="crosshair" size={18} color={colors.primary} /><Text style={styles.pickerLocationText}>Usar minha localização</Text></Pressable>
        </View>
      </View>
    </Modal>
  </View>;
}

function createNearbyRegion(latitude: number, longitude: number): RegionalMapRegion {
  return { latitude, longitude, latitudeDelta: 0.7, longitudeDelta: 0.7 };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  mapContainer: { overflow: 'hidden', backgroundColor: colors.background },
  mapOverlay: { position: 'absolute', right: 16, left: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  searchCard: { flex: 1, padding: 8, gap: 2 },
  searchRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchIconBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primary },
  searchPlaceholder: { flex: 1, color: colors.textMuted, fontSize: 15 },
  cityRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 6 },
  cityText: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '500' },
  changeChip: { minHeight: 28, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.primarySoft },
  changeText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  notificationButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 11, right: 12, width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: colors.surface, backgroundColor: colors.danger },
  pickerBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(16, 45, 45, 0.4)' },
  pickerSheet: { gap: 14, paddingHorizontal: 20, paddingTop: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface },
  pickerTitle: { color: colors.text, fontSize: 20, fontWeight: '600' },
  pickerInput: { minHeight: 52, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 16, backgroundColor: colors.background },
  pickerError: { color: colors.danger, fontSize: 13 },
  pickerLocation: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pickerLocationText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  exploreButtonContainer: {
    position: 'absolute',
    right: 20,
  },
  exploreButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 28,
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
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  backToMapText: { color: colors.primary, fontWeight: '800' },
  greeting: { color: colors.textMuted, fontSize: 15 },
  question: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '600' },
  loadingText: { color: colors.textMuted, fontSize: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: {
    width: '31%',
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  categoryName: { color: colors.text, fontSize: 12, lineHeight: 16, fontWeight: '500', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '600' },
  seeAllButton: { flexDirection: 'row', alignItems: 'center' },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  horizontalList: { flexGrow: 0 },
  horizontalContent: { gap: 10, paddingRight: 4 },
  verticalList: { gap: 10, marginTop: 2 },
  shortcut: { borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
});
