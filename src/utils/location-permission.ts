import * as Location from 'expo-location';

let pendingLocationRequest: Promise<boolean> | null = null;
let requestedThisSession = false;

async function resolveLocationAccess(requestAgain: boolean) {
  const currentPermission = await Location.getForegroundPermissionsAsync();
  if (currentPermission.granted) return true;
  if (!currentPermission.canAskAgain) return false;
  if (requestedThisSession && !requestAgain) return false;
  requestedThisSession = true;
  const requestedPermission = await Location.requestForegroundPermissionsAsync();
  return requestedPermission.granted;
}

export function requestLocationAccess(requestAgain = false) {
  if (!pendingLocationRequest) {
    pendingLocationRequest = resolveLocationAccess(requestAgain).finally(() => { pendingLocationRequest = null; });
  }
  return pendingLocationRequest;
}

export async function hasUsableLocationAccess() {
  const [permission, servicesEnabled] = await Promise.all([
    Location.getForegroundPermissionsAsync(),
    Location.hasServicesEnabledAsync()
  ]);
  return permission.granted && servicesEnabled;
}
