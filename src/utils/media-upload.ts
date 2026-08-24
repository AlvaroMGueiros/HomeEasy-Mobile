import { apiFormRequest, apiRequest } from '../api/api-client';
import { UploadAuthorization } from '../types/api';

export type MediaPurpose = 'profile_photo' | 'request_attachment' | 'chat_attachment' | 'verification_document';

export async function uploadMedia(uri: string, fileName: string, contentType: string, purpose: MediaPurpose) {
  const fileResponse = await fetch(uri);
  const fileBlob = await fileResponse.blob();
  const authorization = await apiRequest<UploadAuthorization>('/media/uploads', {
    method: 'POST', body: JSON.stringify({ fileName, contentType, size: fileBlob.size, purpose })
  });
  const formData = new FormData();
  formData.append('file', { uri, name: fileName, type: contentType } as unknown as Blob);
  await apiFormRequest(`/media/${authorization.mediaId}/content`, formData);
  return authorization.mediaId;
}
