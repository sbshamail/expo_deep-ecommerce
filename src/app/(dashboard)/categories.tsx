import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { flattenTree, listCategoryTree } from '@/api/categories';
import Badge from '@/components/ui/Badge';
import Fab from '@/components/ui/Fab';
import ListRow from '@/components/ui/ListRow';
import { EmptyState, ErrorBanner } from '@/components/ui/Notice';
import Text from '@/components/ui/Text';
import Thumb from '@/components/ui/Thumb';
import { Spacing } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/providers/auth/AuthProvider';

export default function CategoriesScreen() {
  const { can } = useAuth();
  const { data, error, loading, refreshing, reload } = useFetch(() => listCategoryTree());
  const rows = useMemo(() => flattenTree(data ?? []), [data]);
  const canEdit = can('category:update');

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Categories' }} />
      <ErrorBanner message={error} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={({ node }) => String(node.id)}
          onRefresh={reload}
          refreshing={refreshing}
          contentContainerStyle={{ padding: Spacing.md, gap: Spacing.sm, paddingBottom: 96 }}
          renderItem={({ item: { node, depth } }) => (
            <View style={{ marginLeft: depth * 16 }}>
              <ListRow
                onPress={canEdit ? () => router.push(`/category/${node.id}`) : undefined}
                leading={<Thumb uri={node.image?.thumbnail ?? node.image?.original} size={44} />}>
                <Text style={{ fontWeight: '600' }} numberOfLines={1}>
                  {node.name}
                </Text>
                <Text variant="small" color="mutedForeground">
                  {node.children.length ? `${node.children.length} sub-categories` : 'No sub-categories'}
                </Text>
                {!node.is_active ? <Badge label="Hidden" /> : null}
              </ListRow>
            </View>
          )}
          ListEmptyComponent={error ? undefined : <EmptyState title="No categories yet" hint="Tap + to add one." />}
        />
      )}
      {can('category:create') ? <Fab label="Add category" onPress={() => router.push('/category/new')} /> : null}
    </View>
  );
}
