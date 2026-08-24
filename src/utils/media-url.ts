import { environment } from '../config/environment';

export function resolvePublicMediaUrl(mediaId?: string | null) {
  return mediaId ? `${environment.apiUrl}/media/${mediaId}/public` : undefined;
}
