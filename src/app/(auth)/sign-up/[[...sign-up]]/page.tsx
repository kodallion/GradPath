import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/components/auth/clerkAppearance";

export default function SignUpPage() {
  return (
    <AuthShell phase="signup">
      <SignUp
        forceRedirectUrl="/onboarding"
        fallbackRedirectUrl="/onboarding"
        appearance={clerkAppearance}
      />
    </AuthShell>
  );
}

