"use client";
/**
 * AnalyticsProvider — initialises PostHog and fires page-view events.
 * Injected into ClientProviders so it wraps the whole app.
 *
 * Also identifies logged-in users when session is available.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, identifyUser, resetAnalytics, trackPageView } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const prevPath = useRef<string | null>(null);
  const prevUserId = useRef<string | null>(null);

  // Init once on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Page view on every route change
  useEffect(() => {
    if (pathname && pathname !== prevPath.current) {
      prevPath.current = pathname;
      // Small delay so title is set
      const t = setTimeout(() => trackPageView(pathname), 100);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  // Identify / reset on auth change
  useEffect(() => {
    const id = user?.id ?? null;
    if (id && id !== prevUserId.current) {
      prevUserId.current = id;
      identifyUser(id, {
        name: user?.name ?? undefined,
        plan: (user as { plan?: string })?.plan ?? "free",
      });
    } else if (!id && prevUserId.current) {
      prevUserId.current = null;
      resetAnalytics();
    }
  }, [user]);

  return <>{children}</>;
}
