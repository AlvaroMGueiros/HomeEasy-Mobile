import * as Location from 'expo-location';

import { Professional } from '../types/api';

export interface ProfessionalRegionMarker {
  key: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  professionals: Professional[];
}

export async function buildProfessionalRegionMarkers(professionals: Professional[]) {
  const professionalsByRegion = new Map<string, Professional[]>();
  for (const professional of professionals) {
    if (!professional.city || !professional.state) continue;
    const regionKey = `${professional.city}|${professional.state}`;
    const regionProfessionals = professionalsByRegion.get(regionKey);
    if (regionProfessionals) regionProfessionals.push(professional);
    else professionalsByRegion.set(regionKey, [professional]);
  }
  const markers: ProfessionalRegionMarker[] = [];
  for (const [key, regionProfessionals] of professionalsByRegion) {
    const firstProfessional = regionProfessionals[0];
    const locations = await Location.geocodeAsync(`${firstProfessional.city}, ${firstProfessional.state}, Brasil`);
    if (!locations[0]) continue;
    markers.push({
      key,
      city: firstProfessional.city || '',
      state: firstProfessional.state || '',
      latitude: locations[0].latitude,
      longitude: locations[0].longitude,
      professionals: regionProfessionals
    });
  }
  return markers;
}
