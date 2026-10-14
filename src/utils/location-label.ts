import * as Location from 'expo-location';

import { brazilianStates } from '../config/brazilianStates';
import { normalizeSearchText } from './service-search';

const brazilianStateCodes = new Map(brazilianStates.map(state => [normalizeSearchText(state.label), state.value]));

export async function resolveLocationLabel(latitude: number, longitude: number) {
  const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
  const address = addresses[0];
  if (!address) return null;
  const city = address.city || address.subregion || address.district || address.name;
  if (!city) return null;
  const region = resolveRegionLabel(address.region, address.isoCountryCode);
  return region ? `${city}, ${region}` : city;
}

export function resolveRegionLabel(region: string | null, countryCode: string | null) {
  if (!region) return null;
  if (countryCode?.toUpperCase() !== 'BR') return region;
  return brazilianStateCodes.get(normalizeSearchText(region)) || region;
}
