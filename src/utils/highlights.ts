import { Highlight, HighlightLocation, HighlightStatus } from '../types/highlights';
import { Service } from '../types/api';
import { resolveServiceIcon } from './service-icon';

const statusLabels: Record<HighlightStatus, string> = {
  [HighlightStatus.Pending]: 'Em análise', [HighlightStatus.Approved]: 'Publicada', [HighlightStatus.Rejected]: 'Não aprovada',
};

export function resolveHighlightStatus(status: HighlightStatus) { return statusLabels[status]; }

export function formatHighlightDate(createdAt: string) {
  const publishedAt = new Date(createdAt);
  if (Number.isNaN(publishedAt.getTime())) return '';
  return publishedAt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export function resolveHighlightLocation(label?: string, fallback?: { city?: string | null; state?: string | null } | null): HighlightLocation | null {
  const separator = label?.lastIndexOf(',') ?? -1;
  if (label && separator > 0) {
    const city = label.slice(0, separator).trim();
    const state = label.slice(separator + 1).trim().toUpperCase();
    if (city.length > 1 && /^[A-Z]{2}$/.test(state)) return { city, state };
  }
  if (fallback?.city?.trim() && /^[A-Za-z]{2}$/.test(fallback.state || '')) return { city: fallback.city.trim(), state: fallback.state!.toUpperCase() };
  return null;
}

export function buildHighlightsQuery(location: HighlightLocation, serviceId = '', page = 1, limit = 10, filters: { search?: string; category?: string } = {}) {
  const city = location.city.trim();
  const state = location.state.trim().toUpperCase();
  if (city.length < 2 || !/^[A-Z]{2}$/.test(state)) throw new Error('Informe a cidade e selecione o estado.');
  const query = new URLSearchParams({ city, state, page: String(page), limit: String(limit) });
  if (serviceId) query.set('serviceId', serviceId);
  if (filters.search?.trim()) query.set('search', filters.search.trim().slice(0, 80));
  if (filters.category) query.set('category', filters.category);
  return query.toString();
}

export function buildHighlightCategoryOptions(services: Service[]) {
  const categories = new Map<string, { value: string; label: string; icon: ReturnType<typeof resolveServiceIcon> }>();
  categories.set('', { value: '', label: 'Para você', icon: 'star' });
  for (const service of services) {
    if (service.category && !categories.has(service.category)) categories.set(service.category, { value: service.category, label: service.category, icon: resolveServiceIcon(service.category) });
  }
  return [...categories.values()];
}

export function mergeHighlights(current: Highlight[], next: Highlight[]) {
  const highlightsById = new Map(current.map(highlight => [highlight.id, highlight]));
  for (const highlight of next) highlightsById.set(highlight.id, highlight);
  return [...highlightsById.values()];
}
