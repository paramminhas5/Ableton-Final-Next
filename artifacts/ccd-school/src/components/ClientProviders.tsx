"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { TransportProvider } from "@/components/TransportProvider";
import { MasterTransportBar } from "@/components/MasterTransportBar";

const queryClient = new QueryClient();

function ThemeInit() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const DEFAULT_THEME = "ccd-classic";
    const saved = localStorage.getItem("ccd.theme") || DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", saved);
  }, []);
  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TransportProvider>
        <ThemeInit />
        {children}
        <MasterTransportBar />
        <CommandPalette />
      </TransportProvider>
    </QueryClientProvider>
  );
}
