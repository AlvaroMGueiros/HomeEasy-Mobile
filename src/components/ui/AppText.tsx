import { Text, type TextProps } from 'react-native';

import { resolveFontStyle } from '../../theme/typography';

export function AppText({ style, ...props }: TextProps) {
  return <Text {...props} style={[style, resolveFontStyle(style)]} />;
}
