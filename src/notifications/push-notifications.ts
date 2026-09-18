import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { apiRequest } from '../api/api-client';

const notificationChannelId = 'default';
const pushTokenKey = 'homeEasyExpoPushToken';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function registerPushNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(notificationChannelId, {
      name: 'Atualizações do Home Easy',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250]
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  const permission = currentPermission.granted
    ? currentPermission
    : await Notifications.requestPermissionsAsync();
  if (!permission.granted) return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  await apiRequest('/notifications/devices', {
    method: 'PUT',
    body: JSON.stringify({ token: token.data, platform: Platform.OS })
  });
  await SecureStore.setItemAsync(pushTokenKey, token.data);
}

export async function unregisterPushNotifications(): Promise<void> {
  const token = await SecureStore.getItemAsync(pushTokenKey);
  if (!token) return;
  try {
    await apiRequest('/notifications/devices', {
      method: 'DELETE',
      body: JSON.stringify({ token })
    });
  } finally {
    await SecureStore.deleteItemAsync(pushTokenKey);
  }
}

export function readNotificationActionUrl(response: Notifications.NotificationResponse): string | undefined {
  const actionUrl = response.notification.request.content.data?.actionUrl;
  return typeof actionUrl === 'string' ? actionUrl : undefined;
}
