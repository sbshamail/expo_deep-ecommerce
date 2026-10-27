import { Pressable, ScrollView } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

import Text from './Text';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

/** Horizontal filter / tab chips — one is always selected. (iOS/web; Android uses Chips.android.tsx.) */
export default function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // ScrollView defaults to flexShrink:1, so beside a flex:1 list it got squeezed
      // to a fraction of its height (the "half-visible chips" bug). Never shrink.
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={{ gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: Radius.lg * 2,
              borderWidth: 1,
              borderColor: active ? colors.primary : colors.border,
              backgroundColor: active ? colors.primary : colors.card,
            }}>
            <Text variant="small" color={active ? 'primaryForeground' : 'foreground'} style={{ fontWeight: '600' }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
