import { useLocalSearchParams } from 'expo-router';

import OrderDetail from '@/common/order/OrderDetail';

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrderDetail itemId={id} />;
}
