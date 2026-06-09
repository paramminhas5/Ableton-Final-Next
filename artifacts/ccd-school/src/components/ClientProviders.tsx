"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { TransportProvider } from "@/components/TransportProvider";
import { MasterTransportBar } from "@/components/MasterTransportBar";
import { LearnModeProvider } from "@/lib/mode";
import { useProgress, ProgressProvider } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import type { GatingMode } from "@/lib/gating";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { useCelebration } from "@/lib/useCelebration";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { InstallPromptBanner } from "@/components/InstallPromptBanner";
import { EasterEggs } from "@/components/EasterEggs";

const queryClient = new QueryClient();

export const GatingContext = createContext<{ gatingMode: GatingMode }>({
  gatingMode: "paid",
});

export function useGatingMode(): GatingMode {
  return useContext(GatingContext).gatingMode;
}

function ThemeInit() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const DEFAULT_THEME = "ccd-classic";
    const saved = localStorage.getItem("ccd.theme") || DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", saved);
  }, []);
  return null;
}

function GatingLoader({ children }: { children: React.ReactNode }) {
  const [gatingMode, setGatingMode] = useState<GatingMode>("paid");
  useEffect(() => {
    fetch("/api/gating")
      .then((r) => r.json())
      .then((d) => setGatingMode(d.mode ?? "paid"))
      .catch(() => {});
  }, []);
  return (
    <GatingContext.Provider value={{ gatingMode }}>
      {children}
    </GatingContext.Provider>
  );
}

/**
 * CloudSyncEffect — pulls authoritative server state on login,
 * and sends a debounced snapshot for legacy read-only sync.
 * Actual mutations (XP, streaks) now flow through /api/progress/events.
 */
function CloudSyncEffect() {
  const { user } = useAuth();
  const { progress } = useProgress();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialised = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (!initialised.current) {
      initialised.current = true;
      fetch("/api/progress/sync")
        .then((r) => r.json())
        .then((d) => {
          if (d.progress) {
            window.dispatchEvent(
              new CustomEvent("progress:cloud", { detail: d.progress }),
            );
          }
        })
        .catch(() => {});
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch("/api/progress/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      }).catch(() => {});
    }, 5000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [progress, user]);

  return null;
}

/**
 * ServerEventQueue — listens for "progress:server_event" CustomEvents
 * dispatched by the lesson/quiz completion handlers, then POSTs them to
 * /api/progress/events. On success, merges the authoritative response
 * back into client state via "progress:cloud".
 */
function ServerEventQueue() {
  const { user } = useAuth();

  useEffect(() => {
    const handler = async (e: Event) => {
      if (!user) return;
      const event = (e as CustomEvent).detail;
      if (!event?.type) return;

      try {
        const res = await fetch("/api/progress/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.progress) {
          window.dispatchEvent(
            new CustomEvent("progress:cloud", { detail: data.progress }),
          );
        }
      } catch {
        // Network failure — client state already committed locally, no-op
      }
    };

    window.addEventListener("progress:server_event", handler);
    return () => window.removeEventListener("progress:server_event", handler);
  }, [user]);

  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TransportProvider>
          <LearnModeProvider>
            <ProgressProvider>
              <GatingLoader>
                <AnalyticsProvider>
                  <ThemeInit />
                  <CloudSyncEffect />
                  <ServerEventQueue />
                  <CelebrationLayer />
                  {children}
                  {/* Mobile phone UI — hidden on desktop via CSS */}
                  <MobileBottomNav />
                  <InstallPromptBanner />
                  {/* Desktop UI */}
                  <MasterTransportBar />
                  <CommandPalette />
                  {/* Easter eggs — Konami code, idle cat, secret clicks */}
                  <EasterEggs />
                </AnalyticsProvider>
              </GatingLoader>
            </ProgressProvider>
          </LearnModeProvider>
        </TransportProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

function CelebrationLayer() {
  const { celebrationEvent, dismissCelebration } = useCelebration();
  return <CelebrationOverlay event={celebrationEvent} onDone={dismissCelebration} />;
}
