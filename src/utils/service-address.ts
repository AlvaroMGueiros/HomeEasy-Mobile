import { resolveRegionLabel } from './location-label';
import { RegionalMapCoordinate } from './regional-map-html';
import { normalizeSearchText } from './service-search';

export interface ServiceAddress {
  address?: string;
  city: string;
  state: string;
}

export class ServiceAddressError extends Error {}

export interface ServiceAddressMatch extends RegionalMapCoordinate {
  label: string;
}

export function formatServiceAddress(serviceAddress: ServiceAddress) {
  return [serviceAddress.address?.trim(), serviceAddress.city.trim(), serviceAddress.state.trim()].filter(Boolean).join(', ');
}

export function matchesServiceAddress(serviceAddress: ServiceAddress, resolvedAddress: { street?: string; city?: string; region?: string; isoCountryCode?: string; subregion?: string }) {
  if (!resolvedAddress.street || resolvedAddress.isoCountryCode?.toUpperCase() !== 'BR') return false;
  const expectedCity = normalizeSearchText(serviceAddress.city);
  const cityMatches = [resolvedAddress.city, resolvedAddress.subregion].some(city => city && normalizeSearchText(city) === expectedCity);
  if (!cityMatches) return false;
  const resolvedState = resolveRegionLabel(resolvedAddress.region || null, resolvedAddress.isoCountryCode || null);
  if (!resolvedState || normalizeSearchText(resolvedState) !== normalizeSearchText(serviceAddress.state)) return false;
  const streetWords = normalizeSearchText(resolvedAddress.street).split(' ').filter(word => !['rua', 'avenida', 'av', 'r', 'travessa', 'estrada'].includes(word));
  const addressWords = new Set(normalizeSearchText(serviceAddress.address || '').split(' '));
  return streetWords.length > 0 && streetWords.filter(word => addressWords.has(word)).length >= Math.max(1, streetWords.length - 1);
}

export async function resolveServiceAddress(serviceAddress: ServiceAddress): Promise<ServiceAddressMatch[]> {
  if (!serviceAddress.address?.trim() || !serviceAddress.city.trim() || !serviceAddress.state.trim()) {
    throw new ServiceAddressError('O pedido precisa informar rua, cidade e estado para localizar o atendimento.');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const query = new URLSearchParams({ q: `${formatServiceAddress(serviceAddress)}, Brasil`, limit: '5', countrycode: 'BR' });
    const response = await fetch(`https://photon.komoot.io/api/?${query}`, { signal: controller.signal });
    if (response.status === 429) throw new ServiceAddressError('A busca de endereços está ocupada. Aguarde um pouco e tente novamente.');
    if (!response.ok) throw new ServiceAddressError('O serviço de busca de endereços está indisponível. Tente novamente mais tarde.');
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object' || !('features' in result) || !Array.isArray(result.features)) throw new ServiceAddressError('A busca retornou uma resposta inválida. Tente novamente mais tarde.');
    const matches: ServiceAddressMatch[] = [];
    for (const feature of result.features) {
      if (!feature?.properties || feature.geometry?.type !== 'Point' || !Array.isArray(feature.geometry.coordinates)) continue;
      const properties = feature.properties;
      const street = properties.street || (properties.type === 'street' ? properties.name : undefined);
      if (typeof street !== 'string' || typeof properties.city !== 'string' || typeof properties.state !== 'string') continue;
      if (!matchesServiceAddress(serviceAddress, { street, city: properties.city, region: properties.state, isoCountryCode: properties.countrycode })) continue;
      const [longitude, latitude] = feature.geometry.coordinates;
      if (typeof latitude !== 'number' || typeof longitude !== 'number' || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) continue;
      const label = [street, properties.housenumber, properties.district, properties.city, resolveRegionLabel(properties.state, 'BR')].filter(value => typeof value === 'string' && value.trim()).join(', ');
      if (!matches.some(match => match.latitude === latitude && match.longitude === longitude && match.label === label)) matches.push({ latitude, longitude, label });
    }
    if (!matches.length) throw new ServiceAddressError('Não encontramos uma rua compatível nessa cidade. Confira a rua, o bairro e o número com quem fez o pedido.');
    return matches;
  } catch (failure) {
    if (failure instanceof ServiceAddressError) throw failure;
    throw new ServiceAddressError('A consulta do endereço não respondeu. Confira sua conexão e tente novamente.');
  } finally {
    clearTimeout(timeout);
  }
}
