import * as SecureStore from 'expo-secure-store';

import { environment } from '../config/environment';
import { AuthResponse } from '../types/api';

const accessTokenKey = 'homeEasyAccessToken';
const refreshTokenKey = 'homeEasyRefreshToken';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = await SecureStore.getItemAsync(accessTokenKey);
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(`${environment.apiUrl}${path}`, { ...options, headers });
  if (response.status === 401 && retry && await refreshSession()) return apiRequest<T>(path, options, false);
  if (!response.ok) throw new ApiError(await resolveErrorMessage(response), response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function storeSession(session: AuthResponse) {
  await Promise.all([
    SecureStore.setItemAsync(accessTokenKey, session.accessToken),
    SecureStore.setItemAsync(refreshTokenKey, session.refreshToken),
    SecureStore.setItemAsync('homeEasyUser', JSON.stringify(session.user))
  ]);
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(accessTokenKey), SecureStore.deleteItemAsync(refreshTokenKey),
    SecureStore.deleteItemAsync('homeEasyUser')
  ]);
}

export async function readStoredUser() {
  const storedUser = await SecureStore.getItemAsync('homeEasyUser');
  return storedUser ? JSON.parse(storedUser) : null;
}

export async function storeUser(user: AuthResponse['user']) {
  await SecureStore.setItemAsync('homeEasyUser', JSON.stringify(user));
}

async function refreshSession() {
  const refreshToken = await SecureStore.getItemAsync(refreshTokenKey);
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${environment.apiUrl}/auth/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken })
    });
    if (!response.ok) return false;
    await storeSession(await response.json() as AuthResponse);
    return true;
  } catch { return false; }
}

async function resolveErrorMessage(response: Response) {
  try {
    const payload = await response.json() as { message?: string | string[] };
    if (Array.isArray(payload.message)) return payload.message.join(' ');
    if (payload.message) return payload.message;
  } catch { return 'Não foi possível interpretar a resposta do servidor.'; }
  return 'Não foi possível concluir esta operação.';
}
