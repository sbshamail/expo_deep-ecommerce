import { View } from "react-native";

import ProfileCard from "@/common/dashboard/ProfileCard";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/providers/auth/AuthProvider";

export default function DashboardScreen() {
  const { signOut } = useAuth();
  return (
    <Screen style={{ gap: Spacing.md }}>
      <Text variant="title">Dashboard</Text>
      <ProfileCard />
      <View style={{ gap: Spacing.sm }}>
        <ThemeToggle />
        <Button variant="destructive" title="Sign out" onPress={signOut} />
      </View>
    </Screen>
  );
}
