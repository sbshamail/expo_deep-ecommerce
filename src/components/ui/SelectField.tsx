import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

import Text from './Text';

export interface SelectOption<T> {
  value: T;
  label: string;
  /** Indent level, for tree-like lists. */
  depth?: number;
  /** Shown but not pickable (e.g. a parent category when only leaves are allowed). */
  disabled?: boolean;
}

/** Looks like an Input; tapping opens a full-screen list to pick one option. */
export default function SelectField<T>({
  label,
  placeholder = 'Select…',
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  options: SelectOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View style={{ gap: Spacing.xs }}>
      <Text variant="small" color="mutedForeground">
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: Radius.md,
          backgroundColor: colors.card,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}>
        <Text color={current ? 'foreground' : 'mutedForeground'}>{current?.label ?? placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: Spacing.md,
            }}>
            <Text variant="heading">{label}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={10}>
              <Ionicons name="close" size={26} color={colors.foreground} />
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl }}
            renderItem={({ item }) => (
              <Pressable
                disabled={item.disabled}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingLeft: (item.depth ?? 0) * 18,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  opacity: item.disabled ? 0.5 : 1,
                }}>
                <Text style={{ fontWeight: item.value === value ? '700' : '400' }}>{item.label}</Text>
                {item.value === value ? <Ionicons name="checkmark" size={20} color={colors.success} /> : null}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
