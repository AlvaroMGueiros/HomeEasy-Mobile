import type { PurchasesPackage } from 'react-native-purchases';

export const plusOfferInterval = 7 * 24 * 60 * 60 * 1000;

export function canShowPlusOffer(lastShownAt: string | null, now = Date.now()) {
  if (!lastShownAt) return true;
  const previous = Number(lastShownAt);
  return Number.isFinite(previous) && previous >= 0 && now - previous >= plusOfferInterval;
}

export function isPurchaseCancelled(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'userCancelled' in error && error.userCancelled === true);
}
export function resolvePlusBasePlan(selectedPackage: PurchasesPackage) {
  return selectedPackage.product.subscriptionOptions?.find(option => option.isBasePlan && !option.isPrepaid && !option.installmentsInfo &&
    option.billingPeriod?.iso8601 === 'P1M' && Boolean(option.fullPricePhase?.price.formatted) && !option.freePhase && !option.introPhase) || null;
}
