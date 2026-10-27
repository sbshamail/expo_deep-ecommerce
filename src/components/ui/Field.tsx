import { Host, Switch } from '@expo/ui';
import { View } from 'react-native';

import { Spacing } from '@/constants/theme';
import Text from './Text';

/** Form section: small uppercase title + stacked fields. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: Spacing.sm + 4 }}>
      <Text variant="small" color="mutedForeground" style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Label + hint on the left, switch on the right. */
export function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }}>{label}</Text>
        {hint ? (
          <Text variant="small" color="mutedForeground">
            {hint}
          </Text>
        ) : null}
      </View>
      {/* Native Switch: Compose on Android, SwiftUI Toggle on iOS. */}
      <Host matchContents>
        <Switch value={value} onValueChange={onValueChange} />
      </Host>
    </View>
  );
}
