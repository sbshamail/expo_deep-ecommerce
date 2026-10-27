import { Stack } from "expo-router";

import { useTheme } from "@/providers/theme/ThemeProvider";

// Tabs are the home base; every other screen (forms, details) is pushed on
// top with a native header + back button.
export default function DashboardLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: "Back",
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: "Product" }} />
      <Stack.Screen name="stock/[id]" options={{ title: "Manage stock" }} />
      <Stack.Screen name="order/[id]" options={{ title: "Order" }} />
      <Stack.Screen name="categories" options={{ title: "Categories" }} />
      <Stack.Screen name="category/[id]" options={{ title: "Category" }} />
      <Stack.Screen name="blogs" options={{ title: "Blog posts" }} />
      <Stack.Screen name="blog/[id]" options={{ title: "Blog post" }} />
    </Stack>
  );
}
