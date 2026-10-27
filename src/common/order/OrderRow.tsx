import Badge from '@/components/ui/Badge';
import ListRow from '@/components/ui/ListRow';
import Text from '@/components/ui/Text';
import Thumb from '@/components/ui/Thumb';
import { capitalize, formatAttributes, formatDate, formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/auth/AuthProvider';
import { OrderItemRead } from '@/types/shop_types';

import { STATUS_TONE } from './status';

export default function OrderRow({ item, onPress }: { item: OrderItemRead; onPress: () => void }) {
  const { user } = useAuth();
  const options = formatAttributes(item.variant_attributes);
  return (
    <ListRow onPress={onPress} leading={<Thumb uri={item.image?.thumbnail ?? item.image?.original} />}>
      <Text style={{ fontWeight: '600' }} numberOfLines={1}>
        {item.product_name}
      </Text>
      <Text variant="small" color="mutedForeground" numberOfLines={1}>
        {options ? `${options} · ` : ''}Qty {item.quantity} ·{' '}
        {formatMoney(item.price * item.quantity, user?.currency_symbol ?? 'Rs')}
      </Text>
      <Text variant="small" color="mutedForeground" numberOfLines={1}>
        #{item.order_id} · {item.shipping_address?.person_name ?? 'Customer'} · {formatDate(item.created_at)}
      </Text>
      <Badge label={capitalize(item.status)} tone={STATUS_TONE[item.status]} />
    </ListRow>
  );
}
