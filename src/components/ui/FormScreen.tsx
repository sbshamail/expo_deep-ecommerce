import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme/ThemeProvider';

import { ErrorBanner } from './Notice';

/**
 * Scrolling form with a pinned footer (the Save button) that stays above the
 * keyboard. The error sits right above the footer so it's seen on submit.
 */
export default function FormScreen({
  children,
  footer,
  error,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  error?: string | null;
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xl }}>
          {children}
        </ScrollView>
        <View style={{ paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
          <ErrorBanner message={error ?? null} />
          <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.sm }}>{footer}</View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
