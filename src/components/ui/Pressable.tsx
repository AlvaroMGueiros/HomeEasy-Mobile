import { forwardRef } from 'react';
import { Pressable as NativePressable, type PressableProps, type View } from 'react-native';

type Feedback = 'scale' | 'opacity' | 'none';

export type FeedbackPressableProps = PressableProps & { feedback?: Feedback };

const pressedStyles = {
  scale: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  opacity: { opacity: 0.7 },
  none: null,
} as const;

/**
 * Pressable do app com resposta visual ao toque e role de botão por padrão.
 * Use feedback="none" em fundos de modal e áreas que cobrem a tela.
 */
export const Pressable = forwardRef<View, FeedbackPressableProps>(function Pressable(
  { feedback = 'scale', style, accessibilityRole, disabled, ...props },
  ref,
) {
  return <NativePressable
    ref={ref}
    {...props}
    disabled={disabled}
    accessibilityRole={accessibilityRole ?? (props.onPress ? 'button' : undefined)}
    style={state => [
      typeof style === 'function' ? style(state) : style,
      state.pressed && !disabled ? pressedStyles[feedback] : null,
    ]}
  />;
});
