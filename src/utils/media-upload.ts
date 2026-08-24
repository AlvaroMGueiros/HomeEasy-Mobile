import { apiRequest } from '../api/api-client';
import { UploadAuthorization } from '../types/api';

export type MediaPurpose = 'profile_photo' | 'request_attachment' | 'chat_attachment' | 'verification_document';

export async function uploadMedia(uri: string, fileName: string, contentType: string, purpose: MediaPurpose) {
  const fileResponse = await fetch(uri);
  const fileBlob = await fileResponse.blob();
  const authorization = await apiRequest<UploadAuthorization>('/media/uploads', {
    method: 'POST', body: JSON.stringify({ fileName, contentType, size: fileBlob.size, purpose })
  });
  const uploadResponse = await fetch(authorization.uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: fileBlob });
  if (!uploadResponse.ok) throw new Error('Não foi possível enviar o arquivo selecionado.');
  await apiRequest(`/media/${authorization.mediaId}/complete`, { method: 'POST' });
  return authorization.mediaId;
}
