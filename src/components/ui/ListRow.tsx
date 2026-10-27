import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

/** Tappable card row: leading slot, content (children), chevron. */
export default function ListRow({
  leading,
  children,
  onPress,
  chevron = true,
}: {
  leading?: React.ReactNode;
  children: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm + 4,
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: Radius.lg,
        padding: Spacing.sm + 4,
        opacity: pressed && onPress ? 0.85 : 1,
      })}>
      {leading}
      <View style={{ flex: 1, gap: 2 }}>{children}</View>
      {chevron && onPress ? <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} /> : null}
    </Pressable>
  );
}
