import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ImagePickerField, { ImageItem } from '@/components/ui/ImagePickerField';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

export interface VariantDraft {
  /** Local list key. */
  key: string;
  /** Present for variants that already exist on the server. */
  id?: number;
  price: string;
  discount: string;
  stock: string;
  sku: string;
  attrs: { name: string; value: string }[];
  image: ImageItem[];
}

let seq = 0;
export const newVariant = (): VariantDraft => ({
  key: `v${++seq}`,
  price: '',
  discount: '',
  stock: '',
  sku: '',
  attrs: [],
  image: [],
});

/** One variant (e.g. "Red / M"): price, stock and optional options + photo. */
export default function VariantEditor({
  index,
  variant,
  onChange,
  onRemove,
}: {
  index: number;
  variant: VariantDraft;
  onChange: (v: VariantDraft) => void;
  onRemove?: () => void;
}) {
  const { colors } = useTheme();
  const set = <K extends keyof VariantDraft>(k: K, v: VariantDraft[K]) => onChange({ ...variant, [k]: v });
  const setAttr = (i: number, patch: Partial<{ name: string; value: string }>) =>
    set('attrs', variant.attrs.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontWeight: '600' }}>Variant {index + 1}</Text>
        {onRemove ? (
          <Pressable onPress={onRemove} hitSlop={10}>
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          </Pressable>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Input label="Price *" value={variant.price} onChangeText={(t) => set('price', t)} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="Sale price"
            value={variant.discount}
            onChangeText={(t) => set('discount', t)}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Stock *" value={variant.stock} onChangeText={(t) => set('stock', t)} keyboardType="number-pad" />
        </View>
      </View>

      <Input label="SKU (optional)" value={variant.sku} onChangeText={(t) => set('sku', t)} autoCapitalize="characters" />

      {variant.attrs.map((a, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Input label={i === 0 ? 'Option' : undefined} placeholder="Size" value={a.name} onChangeText={(t) => setAttr(i, { name: t })} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label={i === 0 ? 'Value' : undefined} placeholder="M" value={a.value} onChangeText={(t) => setAttr(i, { value: t })} />
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => set('attrs', variant.attrs.filter((_, idx) => idx !== i))}
            style={{ paddingBottom: 12 }}>
            <Ionicons name="close-circle" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>
      ))}
      <Button
        variant="outline"
        title="+ Add option (size, color…)"
        onPress={() => set('attrs', [...variant.attrs, { name: '', value: '' }])}
        style={{ paddingVertical: 10 }}
      />

      <ImagePickerField label="Variant photo (optional)" items={variant.image} onChange={(v) => set('image', v)} size={72} />
    </Card>
  );
}
