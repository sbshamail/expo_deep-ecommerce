import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import { useAuth } from '@/providers/auth/AuthProvider';

export default function ProfileCard() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Card>
      <Text variant="heading">{user.full_name}</Text>
      <Text color="mutedForeground">{user.email}</Text>
      <Text variant="small" color="mutedForeground">
        Shop: {user.default_shop?.name ?? 'none selected'}
      </Text>
    </Card>
  );
}
