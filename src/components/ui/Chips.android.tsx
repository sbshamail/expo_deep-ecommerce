import { FilterChip, Host, LazyRow, Text as ComposeText } from '@expo/ui/jetpack-compose';

import { useTheme } from '@/providers/theme/ThemeProvider';

import type { ChipOption } from './Chips';

/** Android: native Material 3 FilterChips (Jetpack Compose) in a scrolling row. */
export default function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors, scheme } = useTheme();
  return (
    // Fixed height: a Compose LazyRow has no intrinsic height to measure.
    <Host colorScheme={scheme} style={{ height: 56 }}>
      <LazyRow horizontalArrangement={{ spacedBy: 8 }} verticalAlignment="center" contentPadding={{ start: 16, end: 16 }}>
        {options.map((o) => (
          <FilterChip
            key={o.value}
            selected={o.value === value}
            onClick={() => onChange(o.value)}
            colors={{
              containerColor: colors.card,
              labelColor: colors.foreground,
              selectedContainerColor: colors.primary,
              selectedLabelColor: colors.primaryForeground,
            }}
            border={{ width: 1, color: o.value === value ? colors.primary : colors.border }}>
            <FilterChip.Label>
              <ComposeText>{o.label}</ComposeText>
            </FilterChip.Label>
          </FilterChip>
        ))}
      </LazyRow>
    </Host>
  );
}
