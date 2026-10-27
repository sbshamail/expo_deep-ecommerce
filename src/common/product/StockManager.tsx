import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { readProduct, setVariantStock } from '@/api/products';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { EmptyState, ErrorBanner } from '@/components/ui/Notice';
import Text from '@/components/ui/Text';
import Thumb from '@/components/ui/Thumb';
import { Radius, Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import { formatAttributes } from '@/lib/format';
import { useAuth } from '@/providers/auth/AuthProvider';
import { useTheme } from '@/providers/theme/ThemeProvider';
import { ProductVariantRead } from '@/types/shop_types';

import { LOW_STOCK } from './ProductRow';

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.muted,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}>
      <Ionicons name={label === '+' ? 'add' : 'remove'} size={22} color={colors.foreground} />
    </Pressable>
  );
}

function VariantStock({ variant, onSaved }: { variant: ProductVariantRead; onSaved: () => void }) {
  const { token, user, canInShop } = useAuth();
  const [value, setValue] = useState(String(variant.stock));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = Number.parseInt(value, 10);
  const valid = Number.isInteger(next) && next >= 0;
  const dirty = valid && next !== variant.stock;
  const bump = (d: number) => setValue(String(Math.max(0, (valid ? next : variant.stock) + d)));

  const save = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await setVariantStock(token, variant.id, next);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update stock.');
    } finally {
      setSaving(false);
    }
  };

  const title = formatAttributes(variant.attributes) || variant.sku || `Variant ${variant.position + 1}`;
  const tone = variant.stock === 0 ? 'destructive' : variant.stock <= LOW_STOCK ? 'warning' : 'success';

  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: Spacing.sm + 4, alignItems: 'center' }}>
        <Thumb uri={variant.image?.thumbnail ?? variant.image?.original} size={48} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontWeight: '600' }}>{title}</Text>
          <Badge label={variant.stock === 0 ? 'Out of stock' : `${variant.stock} in stock`} tone={tone} />
        </View>
      </View>
      {canInShop(user?.default_shop_id, 'product:update') ? (
        <>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginTop: Spacing.sm }}>
            <Stepper label="-" onPress={() => bump(-1)} />
            <View style={{ flex: 1 }}>
              <Input
                value={value}
                onChangeText={setValue}
                keyboardType="number-pad"
                style={{ textAlign: 'center', fontWeight: '700' }}
              />
            </View>
            <Stepper label="+" onPress={() => bump(1)} />
          </View>
          {error ? (
            <Text variant="small" color="destructive">
              {error}
            </Text>
          ) : null}
          <Button title="Update stock" loading={saving} disabled={!dirty} onPress={save} />
        </>
      ) : null}
    </Card>
  );
}

/** Per-variant stock editor: +/- steppers or type a number, then save. */
export default function StockManager({ productId }: { productId: string }) {
  const { data: product, error, loading, silentReload } = useFetch((t) => readProduct(t, productId));

  if (loading) return <ActivityIndicator style={{ marginTop: Spacing.xl }} />;
  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Manage stock' }} />
      <ErrorBanner message={error} />
      {product ? (
        <>
          <Text variant="heading">{product.name}</Text>
          {product.variants?.length ? (
            product.variants.map((v) => (
              // key includes stock so the input resets to the saved value after a reload
              <VariantStock key={`${v.id}-${v.stock}`} variant={v} onSaved={() => silentReload()} />
            ))
          ) : (
            <EmptyState title="No variants" hint="Edit the product to add a price and stock." />
          )}
        </>
      ) : null}
    </ScrollView>
  );
}
