import { Platform } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { environment } from '../config/environment';
import { HomeEasyPlusStatus } from '../types/subscription';
import { resolvePlusBasePlan } from '../utils/homeEasyPlus';
import { apiRequest, readStoredUser } from './api-client';

let purchaseQueue: Promise<unknown> = Promise.resolve();

export function isPlusBillingConfigured() {
  return Platform.OS === 'android' && environment.plusEnabled && environment.revenueCatAndroidKey.startsWith('goog_');
}

async function assertAccount(userId: string) {
  if ((await readStoredUser())?.id !== userId) throw new Error('Sua conta mudou. Abra o HomeEasy+ novamente.');
}

function withPurchases<T>(userId: string, operation: (purchases: typeof import('react-native-purchases').default) => Promise<T>) {
  const pending = purchaseQueue.catch(() => undefined).then(async () => {
    if (!isPlusBillingConfigured()) throw new Error('As assinaturas pela Google Play ainda não estão disponíveis neste aplicativo.');
    await assertAccount(userId);
    let purchases: typeof import('react-native-purchases').default;
    try { purchases = (await import('react-native-purchases')).default; }
    catch { throw new Error('Instale a versão atualizada do aplicativo para usar a assinatura.'); }
    if (!await purchases.isConfigured()) purchases.configure({ apiKey: environment.revenueCatAndroidKey, appUserID: userId });
    else if (await purchases.getAppUserID() !== userId) await purchases.logIn(userId);
    await assertAccount(userId);
    return operation(purchases);
  });
  purchaseQueue = pending;
  return pending;
}

export function loadPlusPackage(userId: string): Promise<PurchasesPackage | null> {
  return withPurchases(userId, async purchases => {
    const offerings = await purchases.getOfferings();
    const offering = offerings.all[environment.plusOfferingId];
    return offering?.availablePackages.find(available => available.product.identifier.split(':')[0] === environment.plusProductId && resolvePlusBasePlan(available)) || null;
  });
}

export function purchasePlus(userId: string, selectedPackage: PurchasesPackage) {
  return withPurchases(userId, async purchases => {
    const basePlan = resolvePlusBasePlan(selectedPackage);
    if (!basePlan) throw new Error('O plano mensal sem oferta introdutória não está disponível. Tente novamente mais tarde.');
    await purchases.purchaseSubscriptionOption(basePlan);
    await assertAccount(userId);
    return apiRequest<HomeEasyPlusStatus>('/subscriptions/sync', { method: 'POST' });
  });
}

export function restorePlus(userId: string) {
  return withPurchases(userId, async purchases => {
    await purchases.restorePurchases();
    await assertAccount(userId);
    return apiRequest<HomeEasyPlusStatus>('/subscriptions/sync', { method: 'POST' });
  });
}
