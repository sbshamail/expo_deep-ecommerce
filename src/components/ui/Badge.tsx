import { View } from 'react-native';

import { ColorName, Radius } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

import Text from './Text';

/** Small colored status pill. `tone` is any semantic color token. */
export default function Badge({ label, tone = 'mutedForeground' }: { label: string; tone?: ColorName }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: Radius.sm,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: colors[tone] + '22',
      }}>
      <Text variant="small" style={{ color: colors[tone], fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}
