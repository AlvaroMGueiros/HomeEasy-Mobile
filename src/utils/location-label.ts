import * as Location from 'expo-location';

const brazilianStateCodes: Record<string, string> = {
  acre: 'AC', alagoas: 'AL', amapa: 'AP', amazonas: 'AM', bahia: 'BA', ceara: 'CE',
  'distrito federal': 'DF', 'espirito santo': 'ES', goias: 'GO', maranhao: 'MA',
  'mato grosso': 'MT', 'mato grosso do sul': 'MS', 'minas gerais': 'MG', para: 'PA',
  paraiba: 'PB', parana: 'PR', pernambuco: 'PE', piaui: 'PI', 'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN', 'rio grande do sul': 'RS', rondonia: 'RO', roraima: 'RR',
  'santa catarina': 'SC', 'sao paulo': 'SP', sergipe: 'SE', tocantins: 'TO'
};

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
  const normalizedRegion = region.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return brazilianStateCodes[normalizedRegion] || region;
}
