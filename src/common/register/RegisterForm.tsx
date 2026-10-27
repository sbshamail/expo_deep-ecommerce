import { useState } from 'react';
import { View } from 'react-native';

import { register } from '@/api/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import { Spacing } from '@/constants/theme';

export default function RegisterForm() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    const email = form.email.trim().toLowerCase();
    if (form.full_name.trim().length < 2) return setError('Full name is required');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email');
    if (form.phone.trim().length < 7) return setError('Enter a valid phone number');
    if (form.password.length < 3) return setError('Password must be at least 3 characters');
    if (form.password !== form.confirm_password) return setError('Passwords do not match');

    setError(null);
    setLoading(true);
    try {
      await register({
        ...form,
        full_name: form.full_name.trim(),
        email,
        phone: form.phone.trim(),
      });
      setSuccess('Check your email to verify your account, then sign in.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={{ gap: Spacing.md, alignItems: 'center' }}>
        <Text style={{ textAlign: 'center' }}>{success}</Text>
        <TextLink href="/">Go to sign in</TextLink>
      </View>
    );
  }

  return (
    <View style={{ gap: Spacing.md }}>
      <Input label="Full name" value={form.full_name} onChangeText={set('full_name')} />
      <Input
        label="Email"
        value={form.email}
        onChangeText={set('email')}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <Input label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <Input label="Password" value={form.password} onChangeText={set('password')} secureTextEntry />
      <Input
        label="Confirm password"
        value={form.confirm_password}
        onChangeText={set('confirm_password')}
        secureTextEntry
      />
      {error ? (
        <Text variant="small" color="destructive">
          {error}
        </Text>
      ) : null}
      <Button title="Create account" loading={loading} onPress={submit} />
    </View>
  );
}
