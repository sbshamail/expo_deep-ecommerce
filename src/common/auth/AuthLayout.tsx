import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import Screen from "@/components/ui/Screen";
import Text from "@/components/ui/Text";
import { Spacing } from "@/constants/theme";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Shared shell for signin / register / forgot-password screens.
export default function AuthLayout({
  title,
  description,
  children,
  footer,
}: Props) {
  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            gap: Spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: Spacing.xs }}>
            <Text variant="title">{title}</Text>
            {description ? (
              <Text color="mutedForeground">{description}</Text>
            ) : null}
          </View>
          {children}
          {footer ? (
            <View style={{ alignItems: "center", gap: Spacing.xs }}>
              {footer}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
