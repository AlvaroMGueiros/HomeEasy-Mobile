import { Platform } from 'react-native';

const androidEmulatorApiUrl = 'http://10.0.2.2:3000/api';
const localApiUrl = 'http://localhost:3000/api';
const apiUrl = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? androidEmulatorApiUrl : localApiUrl);

export const environment = {
  apiUrl,
  privacyPolicyUrl: `${apiUrl}/legal/privacy`,
  accountDeletionUrl: `${apiUrl}/legal/account-deletion`,
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || ''
};
