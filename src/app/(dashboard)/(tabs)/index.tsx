import { router } from "expo-router";
import { RefreshControl, ScrollView, View } from "react-native";

import { getCounts } from "@/api/dashboard";
import StatCard from "@/common/home/StatCard";
import Button from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/Notice";
import Text from "@/components/ui/Text";
import { Spacing } from "@/constants/theme";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/providers/auth/AuthProvider";

export default function HomeScreen() {
  const { user } = useAuth();
  const { data: counts, error, refreshing, reload } = useFetch(getCounts);

  return (
    <ScrollView
      contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={reload} />
      }
    >
      <View>
        <Text variant="small" color="mutedForeground">
          Welcome back, {user?.full_name.split(" ")[0]}
        </Text>
      </View>

      {!user?.default_shop_id ? (
        <Text color="destructive">
          No shop selected for this account — ask the owner to add you to a
          shop.
        </Text>
      ) : null}
      <ErrorBanner message={error} />

      <View
        style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm + 4 }}
      >
        <StatCard
          label="Orders to handle"
          value={counts?.orders ?? null}
          icon="receipt-outline"
          tone="warning"
          alert={!!counts?.orders}
          onPress={() => router.navigate("/orders")}
        />
        <StatCard
          label="Unanswered questions"
          value={counts?.questions ?? null}
          icon="chatbubbles-outline"
          tone="info"
          alert={!!counts?.questions}
          onPress={() => router.navigate("/questions")}
        />
        <StatCard
          label="Products"
          value={counts?.products ?? null}
          icon="cube-outline"
          onPress={() => router.navigate("/products")}
        />
        <StatCard
          label="Categories"
          value={counts?.categories ?? null}
          icon="folder-outline"
          onPress={() => router.push("/categories")}
        />
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">Quick actions</Text>
        <Button
          title="Add a product"
          onPress={() => router.push("/product/new")}
        />
        <Button
          variant="outline"
          title="Write a blog post"
          onPress={() => router.push("/blog/new")}
        />
      </View>
    </ScrollView>
  );
}
