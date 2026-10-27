import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { listOrderItems } from '@/api/orders';
import OrderRow from '@/common/order/OrderRow';
import Chips from '@/components/ui/Chips';
import { EmptyState, ErrorBanner } from '@/components/ui/Notice';
import { Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import { capitalize } from '@/lib/format';
import { ORDER_ITEM_STATUSES, OrderItemStatus } from '@/types/shop_types';

type Filter = OrderItemStatus | 'all';

export default function OrdersScreen() {
  const { data, error, loading, refreshing, reload } = useFetch(listOrderItems);
  // Pending first: that's the queue the shop needs to work through.
  const [filter, setFilter] = useState<Filter>('pending');

  const items = data?.data;
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items ?? []) c[i.status] = (c[i.status] ?? 0) + 1;
    return c;
  }, [items]);
  const shown = useMemo(
    () => (items ?? []).filter((i) => filter === 'all' || i.status === filter),
    [items, filter],
  );

  return (
    <View style={{ flex: 1 }}>
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          ...ORDER_ITEM_STATUSES.map((s) => ({
            value: s as Filter,
            label: `${capitalize(s)}${counts[s] ? ` (${counts[s]})` : ''}`,
          })),
          { value: 'all', label: 'All' },
        ]}
      />
      <ErrorBanner message={error} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(i) => String(i.id)}
          onRefresh={reload}
          refreshing={refreshing}
          contentContainerStyle={{ padding: Spacing.md, paddingTop: Spacing.xs, gap: Spacing.sm }}
          renderItem={({ item }) => <OrderRow item={item} onPress={() => router.push(`/order/${item.id}`)} />}
          ListEmptyComponent={
            error ? undefined : (
              <EmptyState
                title={filter === 'pending' ? 'All caught up' : 'No orders here'}
                hint={filter === 'pending' ? 'New orders will show up here.' : undefined}
              />
            )
          }
        />
      )}
    </View>
  );
}
