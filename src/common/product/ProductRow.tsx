import { Pressable, View } from 'react-native';

import Badge from '@/components/ui/Badge';
import ListRow from '@/components/ui/ListRow';
import Text from '@/components/ui/Text';
import Thumb from '@/components/ui/Thumb';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/auth/AuthProvider';
import { ProductRead } from '@/types/shop_types';

export const LOW_STOCK = 5;

const priceRange = (p: ProductRead, symbol: string) =>
  p.min_price == null
    ? 'No price'
    : p.min_price === p.max_price
      ? formatMoney(p.min_price, symbol)
      : `${formatMoney(p.min_price, symbol)} – ${formatMoney(p.max_price, symbol)}`;

export default function ProductRow({
  product,
  onPress,
  onStockPress,
}: {
  product: ProductRead;
  onPress: () => void;
  onStockPress: () => void;
}) {
  const { user } = useAuth();
  const stock = product.total_stock;
  const stockTone = stock === 0 ? 'destructive' : stock <= LOW_STOCK ? 'warning' : 'success';
  return (
    <ListRow onPress={onPress} leading={<Thumb uri={product.thumbnail?.thumbnail ?? product.thumbnail?.original} />}>
      <Text style={{ fontWeight: '600' }} numberOfLines={1}>
        {product.name}
      </Text>
      <Text variant="small" color="mutedForeground" numberOfLines={1}>
        {priceRange(product, user?.currency_symbol ?? 'Rs')} · {product.category?.name}
      </Text>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
        <Pressable onPress={onStockPress} hitSlop={6}>
          <Badge label={stock === 0 ? 'Out of stock' : `${stock} in stock`} tone={stockTone} />
        </Pressable>
        {!product.is_active ? <Badge label="Hidden" /> : null}
        {product.is_featured ? <Badge label="Featured" tone="info" /> : null}
      </View>
    </ListRow>
  );
}
