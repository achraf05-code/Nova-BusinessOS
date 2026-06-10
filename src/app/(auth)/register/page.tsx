import type { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your MaBusinessOS workspace.",
};

export default function RegisterPage() {
  return <SignUpForm />;
}
