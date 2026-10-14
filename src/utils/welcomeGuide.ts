import * as SecureStore from 'expo-secure-store';

function guideStorageKey(userId: string) { return `homeEasyWelcomeV1.${userId}`; }

export async function hasSeenWelcomeGuide(userId: string) {
  return await SecureStore.getItemAsync(guideStorageKey(userId)) === 'seen';
}

export async function markWelcomeGuideSeen(userId: string) {
  await SecureStore.setItemAsync(guideStorageKey(userId), 'seen');
}
