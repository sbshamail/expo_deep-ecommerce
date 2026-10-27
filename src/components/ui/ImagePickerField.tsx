import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { PickedImage, pickImages } from '@/lib/images';
import { useTheme } from '@/providers/theme/ThemeProvider';

import Text from './Text';

/** An image already stored on the server, or a freshly picked local one. */
export interface ImageItem {
  uri: string;
  /** Server filename for stored images (used to delete them); absent for new picks. */
  filename?: string;
  file?: PickedImage;
}

export const fromPicked = (p: PickedImage): ImageItem => ({ uri: p.uri, file: p });

/**
 * Row of image tiles with a dashed "add" tile. `max` = 1 behaves as a single
 * picker (a new pick replaces the old one).
 */
export default function ImagePickerField({
  label,
  items,
  onChange,
  max = 1,
  size = 88,
}: {
  label: string;
  items: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  max?: number;
  size?: number;
}) {
  const { colors } = useTheme();

  const add = async () => {
    const picked = await pickImages(Math.max(1, max - items.length));
    if (!picked.length) return;
    const next = picked.map(fromPicked);
    onChange(max === 1 ? next : [...items, ...next].slice(0, max));
  };

  const tile = { width: size, height: size, borderRadius: Radius.md } as const;
  return (
    <View style={{ gap: Spacing.xs }}>
      <Text variant="small" color="mutedForeground">
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
        {items.map((item, i) => (
          <View key={item.uri + i} style={tile}>
            <Image source={{ uri: item.uri }} style={[tile, { backgroundColor: colors.muted }]} contentFit="cover" />
            <Pressable
              accessibilityLabel="Remove image"
              hitSlop={8}
              onPress={() => onChange(items.filter((_, idx) => idx !== i))}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                borderRadius: 12,
                backgroundColor: colors.background + 'dd',
                padding: 2,
              }}>
              <Ionicons name="close" size={16} color={colors.foreground} />
            </Pressable>
          </View>
        ))}
        {items.length < max || max === 1 ? (
          <Pressable
            onPress={add}
            style={[
              tile,
              {
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: colors.border,
                backgroundColor: colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              },
            ]}>
            <Ionicons name="camera-outline" size={24} color={colors.mutedForeground} />
            <Text variant="small" color="mutedForeground">
              {max === 1 && items.length ? 'Change' : 'Add'}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
