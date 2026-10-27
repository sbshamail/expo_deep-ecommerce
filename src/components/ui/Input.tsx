import { TextInput, View, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

import Text from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
}

export default function Input({ label, style, ...rest }: InputProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: Spacing.xs }}>
      {label ? (
        <Text variant="small" color="mutedForeground">
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[
          {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: Radius.md,
            backgroundColor: colors.card,
            color: colors.foreground,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}
