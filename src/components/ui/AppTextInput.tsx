import { TextInput, type TextInputProps } from 'react-native';

import { resolveFontStyle } from '../../theme/typography';

export function AppTextInput({ style, ...props }: TextInputProps) {
  return <TextInput {...props} style={[style, resolveFontStyle(style)]} />;
}
