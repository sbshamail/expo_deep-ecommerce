import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

import { listProducts } from "@/api/products";
import ProductRow, { LOW_STOCK } from "@/common/product/ProductRow";
import Chips from "@/components/ui/Chips";
import Fab from "@/components/ui/Fab";
import Input from "@/components/ui/Input";
import { EmptyState, ErrorBanner } from "@/components/ui/Notice";
import { Spacing } from "@/constants/theme";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/providers/auth/AuthProvider";

type Filter = "all" | "low" | "hidden" | "featured";

export default function ProductsScreen() {
  const { canInShop, user } = useAuth();
  const { data, error, loading, refreshing, reload } = useFetch(listProducts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const products = data?.data;
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (filter === "low") return p.total_stock <= LOW_STOCK;
      if (filter === "hidden") return !p.is_active;
      if (filter === "featured") return p.is_featured;
      return true;
    });
  }, [products, search, filter]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: Spacing.md }}>
        <Input
          placeholder="Search products"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: `All${data ? ` (${data.total})` : ""}` },
          { value: "low", label: "Low stock" },
          { value: "hidden", label: "Hidden" },
          { value: "featured", label: "Featured" },
        ]}
      />
      <ErrorBanner message={error} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(p) => String(p.id)}
          onRefresh={reload}
          refreshing={refreshing}
          contentContainerStyle={{
            padding: Spacing.md,
            paddingTop: Spacing.xs,
            gap: Spacing.sm,
            paddingBottom: 96,
          }}
          renderItem={({ item }) => (
            <ProductRow
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
              onStockPress={() => router.push(`/stock/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            error ? undefined : (
              <EmptyState
                title={products?.length ? "No matches" : "No products yet"}
                hint={
                  products?.length
                    ? "Try another search or filter."
                    : "Tap + to add your first product."
                }
              />
            )
          }
        />
      )}
      {canInShop(user?.default_shop_id, "product:create") ? (
        <Fab label="Add product" onPress={() => router.push("/product/new")} />
      ) : null}
    </View>
  );
}
