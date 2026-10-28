import AuthLayout from "@/common/auth/AuthLayout";
import SigninForm from "@/common/signin/SigninForm";
import TextLink from "@/components/ui/TextLink";

export default function SigninScreen() {
  return (
    <AuthLayout
      title="Admin sign in"
      description="Manage your shop"
      footer={
        <>
          <TextLink href="/forgot-password">Forgot password?</TextLink>
          {/* <Text variant="small" color="mutedForeground" >
            No account? <TextLink href="/register">Register</TextLink>
          </Text> */}
        </>
      }
    >
      <SigninForm />
    </AuthLayout>
  );
}
