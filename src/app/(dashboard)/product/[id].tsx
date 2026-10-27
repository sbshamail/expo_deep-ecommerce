import { useLocalSearchParams } from 'expo-router';

import ProductForm from '@/common/product/ProductForm';

// `id` is a product id, or "new" to create.
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductForm productId={id} />;
}
