"use client";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

export type UserPlan = "free" | "pro";

export const useAuth = () => {
  const { data: session, status } = useSession();
  return {
    session,
    user: session?.user ?? null,
    loading: status === "loading",
    isPro: (session?.user as { plan?: string } | null)?.plan === "pro",
    plan: ((session?.user as { plan?: string } | null)?.plan ?? "free") as UserPlan,
  };
};

export const signOut = () => nextAuthSignOut({ callbackUrl: "/" });
