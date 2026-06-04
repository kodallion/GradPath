import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
