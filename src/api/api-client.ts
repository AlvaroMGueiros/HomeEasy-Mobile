import * as SecureStore from 'expo-secure-store';

import { environment } from '../config/environment';
import { AuthResponse } from '../types/api';

const accessTokenKey = 'homeEasyAccessToken';
const refreshTokenKey = 'homeEasyRefreshToken';
let refreshRequest: Promise<boolean> | null = null;
let sessionGeneration = 0;
let sessionWrites: Promise<void> = Promise.resolve();

function queueSessionWrite(write: () => Promise<void>) {
  const pendingWrite = sessionWrites.then(write);
  sessionWrites = pendingWrite.catch(() => undefined);
  return pendingWrite;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  return executeApiRequest<T>(path, options, retry, true);
}

export async function apiFormRequest<T>(path: string, formData: FormData, retry = true): Promise<T> {
  return executeApiRequest<T>(path, { method: 'POST', body: formData }, retry, false);
}

async function executeApiRequest<T>(
  path: string,
  options: RequestInit,
  retry: boolean,
  usesJson: boolean
): Promise<T> {
  const requestGeneration = sessionGeneration;
  try {
    const accessToken = await SecureStore.getItemAsync(accessTokenKey);
    const headers = new Headers(options.headers);
    if (usesJson) headers.set('Content-Type', 'application/json');
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    const response = await fetch(`${environment.apiUrl}${path}`, { ...options, headers });
    if (response.status === 401 && retry && requestGeneration === sessionGeneration && (await refreshSession())) {
      return executeApiRequest<T>(path, options, false, usesJson);
    }
    if (!response.ok) throw new ApiError(await resolveErrorMessage(response), response.status);
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.', 0);
  }
}

export async function storeSession(session: AuthResponse) {
  sessionGeneration += 1;
  await queueSessionWrite(() => writeSession(session));
}

async function writeSession(session: AuthResponse) {
  await Promise.all([
    SecureStore.setItemAsync(accessTokenKey, session.accessToken),
    SecureStore.setItemAsync(refreshTokenKey, session.refreshToken),
    SecureStore.setItemAsync('homeEasyUser', JSON.stringify(session.user))
  ]);
}

export async function clearSession() {
  sessionGeneration += 1;
  refreshRequest = null;
  await queueSessionWrite(() => Promise.all([
    SecureStore.deleteItemAsync(accessTokenKey),
    SecureStore.deleteItemAsync(refreshTokenKey),
    SecureStore.deleteItemAsync('homeEasyUser')
  ]).then(() => undefined));
}

async function revokeRefreshToken(refreshToken: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${environment.apiUrl}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal
    });
    if (!response.ok) throw new ApiError('Não foi possível revogar a sessão no servidor.', response.status);
  } finally {
    clearTimeout(timeout);
  }
}

export async function endSession() {
  sessionGeneration += 1;
  refreshRequest = null;
  await sessionWrites;
  let refreshToken: string | null = null;
  try { refreshToken = await SecureStore.getItemAsync(refreshTokenKey); }
  finally { await clearSession(); }
  if (refreshToken) await revokeRefreshToken(refreshToken);
}

export async function readStoredUser() {
  const storedUser = await SecureStore.getItemAsync('homeEasyUser');
  return storedUser ? JSON.parse(storedUser) : null;
}

export async function storeUser(user: AuthResponse['user']) {
  const generation = sessionGeneration;
  await queueSessionWrite(async () => {
    if (generation === sessionGeneration) await SecureStore.setItemAsync('homeEasyUser', JSON.stringify(user));
  });
}

async function refreshSession() {
  if (refreshRequest) return refreshRequest;
  const pendingRefresh = performRefresh();
  refreshRequest = pendingRefresh;
  try {
    return await pendingRefresh;
  } finally {
    if (refreshRequest === pendingRefresh) refreshRequest = null;
  }
}

async function performRefresh() {
  const generation = sessionGeneration;
  const refreshToken = await SecureStore.getItemAsync(refreshTokenKey);
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${environment.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (!response.ok) return false;
    const session = (await response.json()) as AuthResponse;
    let stored = false;
    await queueSessionWrite(async () => {
      if (generation !== sessionGeneration) return;
      await writeSession(session);
      stored = true;
    });
    if (!stored) await revokeRefreshToken(session.refreshToken);
    return stored && generation === sessionGeneration;
  } catch {
    return false;
  }
}

function sanitizeUserMessage(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes('econnrefused') ||
    lower.includes('queryfailed') ||
    lower.includes('syntaxerror') ||
    lower.includes('violates foreign key') ||
    lower.includes('internal server error') ||
    lower.includes('typeorm') ||
    lower.includes('database') ||
    lower.includes('sql') ||
    lower.includes('cannot post') ||
    lower.includes('cannot get')
  ) {
    return 'Ocorreu uma instabilidade temporária. Tente novamente em instantes.';
  }
  return raw;
}

async function resolveErrorMessage(response: Response) {
  if (response.status >= 500) {
    return 'Serviço temporariamente indisponível. Tente novamente mais tarde.';
  }
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) return sanitizeUserMessage(payload.message.join(' '));
    if (payload.message) return sanitizeUserMessage(payload.message);
  } catch {
    return 'Não foi possível concluir a solicitação. Tente novamente.';
  }
  return 'Não foi possível concluir esta operação.';
}
