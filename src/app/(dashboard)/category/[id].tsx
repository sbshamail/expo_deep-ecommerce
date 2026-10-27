import { useLocalSearchParams } from 'expo-router';

import CategoryForm from '@/common/category/CategoryForm';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CategoryForm categoryId={id} />;
}
