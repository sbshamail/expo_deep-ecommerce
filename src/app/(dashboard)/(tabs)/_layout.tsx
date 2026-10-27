import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ComponentProps } from "react";
import { ColorValue } from "react-native";

import { useTheme } from "@/providers/theme/ThemeProvider";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tab = (title: string, icon: IconName, active: IconName) => ({
  title,
  tabBarIcon: ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : icon} size={size} color={color as string} />
  ),
});

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={tab("Home", "home-outline", "home")} />
      <Tabs.Screen name="products" options={tab("Products", "cube-outline", "cube")} />
      <Tabs.Screen name="orders" options={tab("Orders", "receipt-outline", "receipt")} />
      <Tabs.Screen name="questions" options={tab("Questions", "chatbubbles-outline", "chatbubbles")} />
      <Tabs.Screen name="more" options={tab("More", "menu-outline", "menu")} />
    </Tabs>
  );
}
