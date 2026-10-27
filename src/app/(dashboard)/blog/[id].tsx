import { useLocalSearchParams } from 'expo-router';

import BlogForm from '@/common/blog/BlogForm';

export default function BlogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BlogForm blogId={id} />;
}
