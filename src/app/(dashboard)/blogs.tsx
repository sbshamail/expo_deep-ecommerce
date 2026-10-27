import { router, Stack } from 'expo-router';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { listBlogs } from '@/api/blogs';
import Badge from '@/components/ui/Badge';
import Fab from '@/components/ui/Fab';
import ListRow from '@/components/ui/ListRow';
import { EmptyState, ErrorBanner } from '@/components/ui/Notice';
import Text from '@/components/ui/Text';
import Thumb from '@/components/ui/Thumb';
import { Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import { formatDate } from '@/lib/format';

export default function BlogsScreen() {
  const { data, error, loading, refreshing, reload } = useFetch(listBlogs);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Blog posts' }} />
      <ErrorBanner message={error} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(b) => String(b.id)}
          onRefresh={reload}
          refreshing={refreshing}
          contentContainerStyle={{ padding: Spacing.md, gap: Spacing.sm, paddingBottom: 96 }}
          renderItem={({ item }) => (
            <ListRow
              onPress={() => router.push(`/blog/${item.id}`)}
              leading={<Thumb uri={item.cover_image?.thumbnail ?? item.cover_image?.original ?? item.video?.thumbnail?.original} />}>
              <Text style={{ fontWeight: '600' }} numberOfLines={2}>
                {item.title}
              </Text>
              {item.excerpt ? (
                <Text variant="small" color="mutedForeground" numberOfLines={2}>
                  {item.excerpt}
                </Text>
              ) : null}
              <Text variant="small" color="mutedForeground">
                {formatDate(item.created_at)}
              </Text>
              {item.video ? <Badge label="Video" tone="info" /> : null}
            </ListRow>
          )}
          ListEmptyComponent={error ? undefined : <EmptyState title="No posts yet" hint="Tap + to write your first post." />}
        />
      )}
      <Fab label="New post" onPress={() => router.push('/blog/new')} />
    </View>
  );
}
