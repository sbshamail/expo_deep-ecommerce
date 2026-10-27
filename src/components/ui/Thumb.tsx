import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

/** Square image with a neutral placeholder when there is none. */
export default function Thumb({ uri, size = 56 }: { uri?: string | null; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Radius.md,
        backgroundColor: colors.muted,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <Ionicons name="image-outline" size={size / 2.5} color={colors.mutedForeground} />
      )}
    </View>
  );
}
