import { Highlight, HighlightLocation, HighlightStatus } from '../types/highlights';

const statusLabels: Record<HighlightStatus, string> = {
  [HighlightStatus.Pending]: 'Em análise', [HighlightStatus.Approved]: 'Publicada', [HighlightStatus.Rejected]: 'Não aprovada',
};

export function resolveHighlightStatus(status: HighlightStatus) { return statusLabels[status]; }

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

export function buildHighlightsQuery(location: HighlightLocation, serviceId = '', page = 1, limit = 10) {
  const city = location.city.trim();
  const state = location.state.trim().toUpperCase();
  if (city.length < 2 || !/^[A-Z]{2}$/.test(state)) throw new Error('Informe a cidade e selecione o estado.');
  const query = new URLSearchParams({ city, state, page: String(page), limit: String(limit) });
  if (serviceId) query.set('serviceId', serviceId);
  return query.toString();
}

export function mergeHighlights(current: Highlight[], next: Highlight[]) {
  const highlightsById = new Map(current.map(highlight => [highlight.id, highlight]));
  for (const highlight of next) highlightsById.set(highlight.id, highlight);
  return [...highlightsById.values()];
}
