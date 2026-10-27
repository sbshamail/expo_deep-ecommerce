import AuthLayout from '@/common/auth/AuthLayout';
import ForgotPasswordForm from '@/common/forgot-password/ForgotPasswordForm';
import TextLink from '@/components/ui/TextLink';

export default function ForgotPasswordScreen() {
  return (
    <AuthLayout
      title="Forgot password?"
      description="We'll email you a 6-digit code to reset it"
      footer={<TextLink href="/">Back to sign in</TextLink>}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
