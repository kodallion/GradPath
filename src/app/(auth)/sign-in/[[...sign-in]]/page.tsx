import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/components/auth/clerkAppearance";

export default function SignInPage() {
  return (
    <AuthShell phase="signin">
      <SignIn appearance={clerkAppearance} />
    </AuthShell>
  );
}

