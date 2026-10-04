import * as ImagePicker from 'expo-image-picker';

import { uploadMedia } from './media-upload';

export async function chooseProfessionalImage(isCover = false) {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: isCover ? [3, 1] : [4, 3], quality: 0.8 });
  if (result.canceled) return null;
  const image = result.assets[0];
  return uploadMedia(image.uri, image.fileName || 'professionalPhoto.jpg', image.mimeType || 'image/jpeg', 'profile_photo');
}
