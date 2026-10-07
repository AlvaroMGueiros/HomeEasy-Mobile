import 'tsx/cjs';
import { ConfigContext } from 'expo/config';

import { colors } from './src/theme/colors';

export default function configureApp({ config }: ConfigContext) {
  return {
    ...config,
    plugins: config.plugins?.map(plugin => {
      if (Array.isArray(plugin) && plugin[0] === 'expo-notifications') {
        return [plugin[0], { ...plugin[1], color: colors.primary }];
      }
      return plugin;
    })
  };
}
