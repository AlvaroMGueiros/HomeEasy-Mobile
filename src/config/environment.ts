import { Platform } from 'react-native';

const androidEmulatorApiUrl = 'http://10.0.2.2:3000/api';
const localApiUrl = 'http://localhost:3000/api';

export const environment = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? androidEmulatorApiUrl : localApiUrl)
};
