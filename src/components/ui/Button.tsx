import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

import Text from './Text';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: 'primary' | 'outline' | 'destructive';
  loading?: boolean;
}

export default function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const bg = { primary: colors.primary, outline: 'transparent', destructive: colors.destructive }[variant];
  const fg = variant === 'outline' ? 'foreground' : 'primaryForeground';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [
        {
          backgroundColor: bg,
          borderColor: colors.border,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: Radius.md,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: disabled || loading ? 0.6 : state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={colors[fg]} />
      ) : (
        <Text color={fg} style={{ fontWeight: '600' }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
