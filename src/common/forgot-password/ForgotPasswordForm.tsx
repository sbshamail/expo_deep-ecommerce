import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { resetPassword, sendResetOtp } from '@/api/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import { Spacing } from '@/constants/theme';

type Step = 'email' | 'reset' | 'done';

const RESEND_SECONDS = 30;

// Two backend calls in order: POST /otp-send-email (emails a 6-digit code),
// then POST /reset-password (verifies it and sets the new password).
export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const sendCode = async () => {
    const address = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(address)) return setError('Enter a valid email');
    setError(null);
    setLoading(true);
    try {
      await sendResetOtp(address);
      setEmail(address);
      setSecondsLeft(RESEND_SECONDS);
      setStep('reset');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code');
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (otp.length !== 6) return setError('Enter the 6-digit code');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setError(null);
    setLoading(true);
    try {
      await resetPassword({ email, otp, new_password: password, confirm_password: confirm });
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reset your password');
    } finally {
      setLoading(false);
    }
  };

  const errorText = error ? (
    <Text variant="small" color="destructive">
      {error}
    </Text>
  ) : null;

  if (step === 'done') {
    return (
      <View style={{ gap: Spacing.md, alignItems: 'center' }}>
        <Text style={{ textAlign: 'center' }}>
          Your password has been reset. You can now sign in with the new one.
        </Text>
        <TextLink href="/">Go to sign in</TextLink>
      </View>
    );
  }

  if (step === 'reset') {
    return (
      <View style={{ gap: Spacing.md }}>
        <Text variant="small" color="mutedForeground">
          If {email} has an account, a 6-digit code is on its way (valid 10 minutes).
        </Text>
        <Input
          label="Verification code"
          value={otp}
          onChangeText={(v) => setOtp(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Input label="New password" value={password} onChangeText={setPassword} secureTextEntry />
        <Input label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry />
        {errorText}
        <Button title="Reset password" loading={loading} onPress={reset} />
        <Button
          variant="outline"
          title={secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
          disabled={secondsLeft > 0}
          onPress={sendCode}
        />
        <Button
          variant="outline"
          title="Use a different email"
          onPress={() => {
            setError(null);
            setStep('email');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: Spacing.md }}>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      {errorText}
      <Button title="Send code" loading={loading} onPress={sendCode} />
    </View>
  );
}
