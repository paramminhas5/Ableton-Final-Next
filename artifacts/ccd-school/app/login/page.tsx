import type { Metadata } from "next";
import { LoginPageClient } from "@/components/LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In — CCD.SCHOOL",
  description: "Sign in to save your progress across devices.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
