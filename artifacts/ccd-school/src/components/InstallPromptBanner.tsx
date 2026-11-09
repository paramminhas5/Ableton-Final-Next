"use client";
/**
 * InstallPromptBanner
 *
 * Param asked for the "install for offline" popup to go (10 Nov 2026).
 * This component now shows nothing. It still listens for the browser's
 * `beforeinstallprompt` event and cancels it, so Chrome on Android does
 * not put up its own "add to home screen" bar either. The manifest and
 * service worker stay, so anyone who wants the app on their home screen
 * can still add it from the browser menu.
 */
import { useEffect } from "react";

export function InstallPromptBanner() {
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  return null;
}

export default InstallPromptBanner;
