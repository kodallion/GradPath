import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-4">
      <SignUp />
    </div>
  );
}
