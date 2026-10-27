import AuthLayout from '@/common/auth/AuthLayout';
import RegisterForm from '@/common/register/RegisterForm';
import TextLink from '@/components/ui/TextLink';

export default function RegisterScreen() {
  return (
    <AuthLayout
      title="Create account"
      description="We'll email you a link to verify it"
      footer={<TextLink href="/">Back to sign in</TextLink>}>
      <RegisterForm />
    </AuthLayout>
  );
}
