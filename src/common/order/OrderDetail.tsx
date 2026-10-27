import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, View } from 'react-native';

import { readOrderItem, updateOrderItemStatus } from '@/api/orders';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chips from '@/components/ui/Chips';
import { ErrorBanner } from '@/components/ui/Notice';
import Text from '@/components/ui/Text';
import Thumb from '@/components/ui/Thumb';
import { Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import { capitalize, formatAttributes, formatDate, formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/auth/AuthProvider';
import { ORDER_ITEM_STATUSES, OrderItemStatus } from '@/types/shop_types';

import { NEXT_STEP, STATUS_TONE } from './status';

const Line = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md }}>
      <Text color="mutedForeground">{label}</Text>
      <Text style={{ flex: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  ) : null;

export default function OrderDetail({ itemId }: { itemId: string }) {
  const { token, user, canInShop } = useAuth();
  const { data: item, setData, error, loading } = useFetch((t) => readOrderItem(t, itemId));
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canUpdate = canInShop(user?.default_shop_id, 'order:update');

  const change = async (status: OrderItemStatus) => {
    if (!token || !item || status === item.status) return;
    setSaving(true);
    setActionError(null);
    try {
      const updated = await updateOrderItemStatus(token, item.id, status);
      setData({ ...item, ...updated });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not update the order.');
    } finally {
      setSaving(false);
    }
  };

  const confirmCancel = () =>
    Alert.alert('Cancel this order?', 'The customer will see it as cancelled.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: () => change('cancelled') },
    ]);

  if (loading) return <ActivityIndicator style={{ marginTop: Spacing.xl }} />;
  if (!item) return <ErrorBanner message={error ?? 'Order not found'} />;

  const addr = item.shipping_address;
  const symbol = user?.currency_symbol ?? 'Rs';
  const next = NEXT_STEP[item.status];
  const open = item.status !== 'cancelled' && item.status !== 'delivered';

  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}>
      <Stack.Screen options={{ title: `Order #${item.order_id}` }} />
      <ErrorBanner message={actionError ?? error} />

      <Card>
        <View style={{ flexDirection: 'row', gap: Spacing.sm + 4 }}>
          <Thumb uri={item.image?.thumbnail ?? item.image?.original} size={64} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontWeight: '600' }}>{item.product_name}</Text>
            {formatAttributes(item.variant_attributes) ? (
              <Text variant="small" color="mutedForeground">
                {formatAttributes(item.variant_attributes)}
              </Text>
            ) : null}
            <Badge label={capitalize(item.status)} tone={STATUS_TONE[item.status]} />
          </View>
        </View>
        <Line label="Quantity" value={String(item.quantity)} />
        <Line label="Price each" value={formatMoney(item.price, symbol)} />
        <Line label="Total" value={formatMoney(item.price * item.quantity, symbol)} />
        <Line label="Placed" value={formatDate(item.created_at)} />
      </Card>

      {addr ? (
        <Card>
          <Text variant="heading">Deliver to</Text>
          <Line label="Name" value={addr.person_name} />
          <Line label="Phone" value={addr.phone} />
          <Line label="Address" value={addr.details} />
          <Line label="City" value={[addr.city, addr.region].filter(Boolean).join(', ')} />
          <Line label="Postal code" value={addr.postal_code} />
          {addr.phone ? (
            <Button variant="outline" title={`Call ${addr.person_name}`} onPress={() => Linking.openURL(`tel:${addr.phone}`)} />
          ) : null}
        </Card>
      ) : null}

      {canUpdate ? (
        <Card>
          <Text variant="heading">Update status</Text>
          {next ? <Button title={next.label} loading={saving} onPress={() => change(next.to)} /> : null}
          <Chips
            value={item.status}
            onChange={(s) => (s === 'cancelled' ? confirmCancel() : change(s))}
            options={ORDER_ITEM_STATUSES.map((s) => ({ value: s, label: capitalize(s) }))}
          />
          {open ? (
            <Button variant="outline" title="Cancel order" disabled={saving} onPress={confirmCancel} />
          ) : null}
        </Card>
      ) : null}
    </ScrollView>
  );
}
