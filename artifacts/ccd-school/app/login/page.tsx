import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPageClient } from "@/components/LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to save your progress across devices.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  );
}
