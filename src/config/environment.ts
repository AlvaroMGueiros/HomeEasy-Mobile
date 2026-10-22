import { Platform } from 'react-native';

const androidEmulatorApiUrl = 'http://10.0.2.2:3000/api';
const localApiUrl = 'http://localhost:3000/api';
const apiUrl = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? androidEmulatorApiUrl : localApiUrl);
if (!__DEV__ && (!process.env.EXPO_PUBLIC_API_URL || new URL(apiUrl).protocol !== 'https:')) {
  throw new Error('Configure EXPO_PUBLIC_API_URL com HTTPS para distribuir o aplicativo.');
}

export const environment = {
  apiUrl,
  plusEnabled: process.env.EXPO_PUBLIC_HOME_EASY_PLUS_ENABLED === 'true',
  revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
  plusOfferingId: process.env.EXPO_PUBLIC_PLUS_OFFERING_ID || 'homeEasyPlus',
  plusProductId: process.env.EXPO_PUBLIC_PLUS_PRODUCT_ID || 'homeeasy_plus_monthly',
  plusTermsUrl: `${apiUrl}/subscriptions/terms`,
  privacyPolicyUrl: `${apiUrl}/legal/privacy`,
  accountDeletionUrl: `${apiUrl}/legal/account-deletion`,
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || ''
};
