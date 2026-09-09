import * as Location from 'expo-location';

export async function requestLocationAccess() {
  const currentPermission = await Location.getForegroundPermissionsAsync();
  if (currentPermission.granted) return true;
  if (!currentPermission.canAskAgain) return false;
  const requestedPermission = await Location.requestForegroundPermissionsAsync();
  return requestedPermission.granted;
}

export async function hasUsableLocationAccess() {
  const [permission, servicesEnabled] = await Promise.all([
    Location.getForegroundPermissionsAsync(),
    Location.hasServicesEnabledAsync()
  ]);
  return permission.granted && servicesEnabled;
}
