import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { ComponentProps } from 'react';
import { ScrollView, View } from 'react-native';

import ProfileCard from '@/common/dashboard/ProfileCard';
import ThemeToggle from '@/components/ThemeToggle';
import Button from '@/components/ui/Button';
import ListRow from '@/components/ui/ListRow';
import Text from '@/components/ui/Text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth/AuthProvider';
import { useTheme } from '@/providers/theme/ThemeProvider';

type Entry = { title: string; hint: string; icon: ComponentProps<typeof Ionicons>['name']; href: Href };

const ENTRIES: Entry[] = [
  { title: 'Categories', hint: 'Organise your catalogue', icon: 'folder-outline', href: '/categories' },
  { title: 'Blog posts', hint: 'News, offers and updates', icon: 'newspaper-outline', href: '/blogs' },
];

export default function MoreScreen() {
  const { signOut } = useAuth();
  const { colors } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}>
      <ProfileCard />
      <View style={{ gap: Spacing.sm }}>
        {ENTRIES.map((e) => (
          <ListRow
            key={e.title}
            onPress={() => router.push(e.href)}
            leading={<Ionicons name={e.icon} size={24} color={colors.foreground} />}>
            <Text style={{ fontWeight: '600' }}>{e.title}</Text>
            <Text variant="small" color="mutedForeground">
              {e.hint}
            </Text>
          </ListRow>
        ))}
      </View>
      <View style={{ gap: Spacing.sm }}>
        <ThemeToggle />
        <Button variant="destructive" title="Sign out" onPress={signOut} />
      </View>
    </ScrollView>
  );
}
