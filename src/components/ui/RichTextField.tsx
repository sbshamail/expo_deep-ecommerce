import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import {
  EnrichedTextInput,
  type EnrichedTextInputInstance,
  type OnChangeStateEvent,
} from 'react-native-enriched-html';

import { Radius, Spacing } from '@/constants/theme';
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
}: RichTextFieldProps) {
  const { colors } = useTheme();
  const ref = useRef<EnrichedTextInputInstance>(null);
  const lastEmitted = useRef(value);
  const [state, setState] = useState<OnChangeStateEvent | null>(null);

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
