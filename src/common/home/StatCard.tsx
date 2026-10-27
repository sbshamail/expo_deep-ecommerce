import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import Text from '@/components/ui/Text';
import { ColorName, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

import { ComponentProps } from 'react';

/** Big-number tile; `alert` tints it when the number needs attention. */
export default function StatCard({
  label,
  value,
  icon,
  tone = 'foreground',
  alert,
  onPress,
}: {
  label: string;
  value: number | null;
  icon: ComponentProps<typeof Ionicons>['name'];
  tone?: ColorName;
  alert?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexBasis: '47%',
        flexGrow: 1,
        backgroundColor: colors.card,
        borderColor: alert ? colors[tone] : colors.border,
        borderWidth: 1,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        gap: Spacing.sm,
        opacity: pressed ? 0.85 : 1,
      })}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text color="mutedForeground" variant="small">
          {label}
        </Text>
        <Ionicons name={icon} size={18} color={alert ? colors[tone] : colors.mutedForeground} />
      </View>
      <Text variant="title" style={alert ? { color: colors[tone] } : undefined}>
        {value ?? '–'}
      </Text>
    </Pressable>
  );
}
