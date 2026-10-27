import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { ColorName } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

type Variant = 'title' | 'heading' | 'body' | 'small';

const variants = {
  title: { fontSize: 28, fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  small: { fontSize: 13, fontWeight: '400' },
} as const;

export interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: ColorName;
}

export default function Text({ variant = 'body', color = 'foreground', style, ...rest }: TextProps) {
  const { colors } = useTheme();
  return <RNText style={[variants[variant], { color: colors[color] }, style]} {...rest} />;
}
