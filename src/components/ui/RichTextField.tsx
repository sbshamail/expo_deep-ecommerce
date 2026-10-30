import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import {
  EnrichedTextInput,
  type EnrichedTextInputInstance,
  type OnChangeStateEvent,
} from 'react-native-enriched-html';

import { Radius, Spacing } from '@/constants/theme';
import { PickedImage, pickImages } from '@/lib/images';
import { useTheme } from '@/providers/theme/ThemeProvider';

import Text from './Text';

type ToolbarItem = {
  key: string;
  icon?: keyof typeof Ionicons.glyphMap;
  text?: string;
  run: (input: EnrichedTextInputInstance) => void;
  active: (s: OnChangeStateEvent) => boolean;
};

const TOOLBAR: ToolbarItem[] = [
  { key: 'bold', text: 'B', run: (i) => i.toggleBold(), active: (s) => s.bold.isActive },
  { key: 'italic', text: 'I', run: (i) => i.toggleItalic(), active: (s) => s.italic.isActive },
  { key: 'underline', text: 'U', run: (i) => i.toggleUnderline(), active: (s) => s.underline.isActive },
  { key: 'h2', text: 'H2', run: (i) => i.toggleH2(), active: (s) => s.h2.isActive },
  { key: 'h3', text: 'H3', run: (i) => i.toggleH3(), active: (s) => s.h3.isActive },
  { key: 'ul', icon: 'list', run: (i) => i.toggleUnorderedList(), active: (s) => s.unorderedList.isActive },
  { key: 'ol', icon: 'list-circle-outline', run: (i) => i.toggleOrderedList(), active: (s) => s.orderedList.isActive },
];

interface RichTextFieldProps {
  label?: string;
  /** HTML — the same format the web admin's rich-text editor stores. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  /**
   * Adds an Image button to the toolbar. Uploads the picked photo and resolves
   * to its public URL, which is what gets embedded in the HTML.
   */
  onUploadImage?: (image: PickedImage) => Promise<string>;
}

/**
 * Rich-text input (bold / italic / headings / lists) over react-native-enriched-html.
 * The native input is uncontrolled, so `value` is only pushed into it when it
 * differs from the last HTML the editor itself emitted (e.g. the AI import
 * filling the field) — typing never round-trips through `setValue`.
 */
export default function RichTextField({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 110,
  onUploadImage,
}: RichTextFieldProps) {
  const { colors } = useTheme();
  const ref = useRef<EnrichedTextInputInstance>(null);
  const lastEmitted = useRef(value);
  const [state, setState] = useState<OnChangeStateEvent | null>(null);
  const [uploading, setUploading] = useState(false);

  const insertImage = async () => {
    if (!onUploadImage || uploading) return;
    const [picked] = await pickImages(1);
    if (!picked) return;
    setUploading(true);
    try {
      const src = await onUploadImage(picked);
      // The native view needs a size to lay the image out; keep the aspect
      // ratio but cap the width to something that fits a phone screen.
      const w = picked.width || 300;
      const h = picked.height || 300;
      const width = Math.min(w, 300);
      ref.current?.setImage(src, width, Math.round((h * width) / w));
    } catch (e) {
      Alert.alert('Image upload failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    ref.current?.setValue(value);
  }, [value]);

  return (
    <View style={{ gap: Spacing.xs }}>
      {label ? (
        <Text variant="small" color="mutedForeground">
          {label}
        </Text>
      ) : null}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: Radius.md,
          backgroundColor: colors.card,
          overflow: 'hidden',
        }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 0 }}
          contentContainerStyle={{ padding: Spacing.xs, gap: Spacing.xs }}>
          {TOOLBAR.map((item) => {
            const on = state ? item.active(state) : false;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.key}
                onPress={() => ref.current && item.run(ref.current)}
                style={{
                  minWidth: 36,
                  height: 34,
                  paddingHorizontal: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: Radius.sm,
                  backgroundColor: on ? colors.primary : 'transparent',
                }}>
                {item.text ? (
                  <Text
                    color={on ? 'primaryForeground' : 'foreground'}
                    style={{
                      fontWeight: item.key === 'bold' || item.key.startsWith('h') ? '800' : '500',
                      fontStyle: item.key === 'italic' ? 'italic' : 'normal',
                      textDecorationLine: item.key === 'underline' ? 'underline' : 'none',
                    }}>
                    {item.text}
                  </Text>
                ) : (
                  <Ionicons
                    name={item.icon!}
                    size={20}
                    color={on ? colors.primaryForeground : colors.foreground}
                  />
                )}
              </Pressable>
            );
          })}
          {onUploadImage ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="image"
              disabled={uploading}
              onPress={insertImage}
              style={{
                minWidth: 36,
                height: 34,
                paddingHorizontal: 8,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: Radius.sm,
              }}>
              {uploading ? (
                <ActivityIndicator size="small" color={colors.foreground} />
              ) : (
                <Ionicons name="image-outline" size={20} color={colors.foreground} />
              )}
            </Pressable>
          ) : null}
        </ScrollView>
        <EnrichedTextInput
          ref={ref}
          defaultValue={value}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          cursorColor={colors.primary}
          selectionColor={colors.primary}
          scrollEnabled={false}
          onChangeState={(e) => setState(e.nativeEvent)}
          onChangeHtml={(e) => {
            lastEmitted.current = e.nativeEvent.value;
            onChange(e.nativeEvent.value);
          }}
          htmlStyle={{ a: { color: colors.primary }, ul: { bulletColor: colors.foreground } }}
          style={{
            minHeight,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.foreground,
          }}
        />
      </View>
    </View>
  );
}
