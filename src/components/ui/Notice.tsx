import { View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

import Text from './Text';

/** Inline error banner — shown above content, never instead of it. */
export function ErrorBanner({ message }: { message: string | null }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View
      style={{
        backgroundColor: colors.destructive + '1f',
        borderRadius: Radius.md,
        padding: Spacing.sm + 4,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
      }}>
      <Text variant="small" style={{ color: colors.destructive }}>
        {message}
      </Text>
    </View>
  );
}

/** "Nothing here" — distinct from an error. */
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={{ alignItems: 'center', padding: Spacing.xl, gap: Spacing.xs }}>
      <Text variant="heading">{title}</Text>
      {hint ? (
        <Text color="mutedForeground" style={{ textAlign: 'center' }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
