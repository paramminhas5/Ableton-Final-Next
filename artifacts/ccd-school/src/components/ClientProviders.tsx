"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { TransportProvider } from "@/components/TransportProvider";
import { MasterTransportBar } from "@/components/MasterTransportBar";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import type { GatingMode } from "@/lib/gating";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { useCelebration } from "@/lib/useCelebration";

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
    }, 2000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [progress, user]);

  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TransportProvider>
          <GatingLoader>
            <ThemeInit />
            <CloudSyncEffect />
            <CelebrationLayer />
            {children}
            <MasterTransportBar />
            <CommandPalette />
          </GatingLoader>
        </TransportProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

function CelebrationLayer() {
  const { celebrationEvent, dismissCelebration } = useCelebration();
  return <CelebrationOverlay event={celebrationEvent} onDone={dismissCelebration} />;
}
