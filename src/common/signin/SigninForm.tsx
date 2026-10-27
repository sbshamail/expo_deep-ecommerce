import { useState } from 'react';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth/AuthProvider';

export default function SigninForm() {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!identifier.trim() || !password) {
      setError('Email/phone and password are required');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn({ identifier: identifier.trim(), password });
      // No navigation here: the Stack.Protected guard in app/_layout.tsx
      // swaps to the dashboard as soon as the user is set.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: Spacing.md }}>
      <Input
        label="Email or phone"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? (
        <Text variant="small" color="destructive">
          {error}
        </Text>
      ) : null}
      <Button title="Sign in" loading={loading} onPress={submit} />
    </View>
  );
}
