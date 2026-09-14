import { File } from 'expo-file-system';

import { ApiError, apiRequest } from '../api/api-client';
import { UploadAuthorization } from '../types/api';

export type MediaPurpose = 'profile_photo' | 'request_attachment' | 'chat_attachment' | 'verification_document';

export async function uploadMedia(uri: string, fileName: string, contentType: string, purpose: MediaPurpose) {
  const file = new File(uri);
  if (!file.size) throw new Error('Não foi possível ler o arquivo selecionado.');
  const authorization = await apiRequest<UploadAuthorization>('/media/uploads', {
    method: 'POST', body: JSON.stringify({ fileName, contentType, size: file.size, purpose })
  });
  const uploadResponse = await fetch(authorization.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file
  });
  if (!uploadResponse.ok) {
    throw new ApiError('Não foi possível enviar a imagem. Verifique sua conexão e tente novamente.', uploadResponse.status);
  }
  await apiRequest(`/media/${authorization.mediaId}/complete`, { method: 'POST' });
  return authorization.mediaId;
}
