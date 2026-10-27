import { type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

// Root wrapper for every screen: safe-area + themed background + padding.
export default function Screen({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.background, padding: Spacing.md }, style]}
      {...rest}
    />
  );
}
