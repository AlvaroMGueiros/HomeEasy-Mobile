import * as SecureStore from 'expo-secure-store';

import { communityRulesVersion } from '../config/communityRules';

export async function hasAcceptedCommunityRules(userId: string) {
  return await SecureStore.getItemAsync(`homeEasyCommunityRules.${userId}`) === communityRulesVersion;
}

export function acceptCommunityRules(userId: string) {
  return SecureStore.setItemAsync(`homeEasyCommunityRules.${userId}`, communityRulesVersion);
}
