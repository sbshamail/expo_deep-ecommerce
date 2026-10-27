import { useLocalSearchParams } from 'expo-router';

import StockManager from '@/common/product/StockManager';

export default function StockScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StockManager productId={id} />;
}
