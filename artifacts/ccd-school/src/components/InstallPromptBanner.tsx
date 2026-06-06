"use client";
/**
 * InstallPromptBanner
 *
 * Shows a native "Add to Home Screen" prompt on two paths:
 *
 *  Android / Chrome / Edge
 *    — Intercepts the browser's `beforeinstallprompt` event, suppresses
 *      the browser's default mini-infobar, and shows our branded banner
 *      instead. Tapping "Install" triggers the native install flow.
 *
 *  iOS / Safari
 *    — No programmatic API exists on iOS. We detect Safari on iOS and
 *      show a bottom sheet with step-by-step screenshots (share icon →
 *      "Add to Home Screen").
 *
 * Suppression rules (banner never shown when):
 *   - Already running in standalone / installed mode
 *   - User previously dismissed (localStorage flag, 30-day cooldown)
 *   - User already installed (app reports display=standalone)
 *
 * The banner sits above the MobileBottomNav (bottom: 64px on mobile).
 */

import { useState, useEffect, useCallback } from "react";
import { track } from "@/lib/analytics";

// ── Detect installed / standalone mode ────────────────────────────────────────
function isInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari sets this when launched from home screen
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

// ── Detect iOS Safari ─────────────────────────────────────────────────────────
function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
  return isIOS && isSafari;
}

// ── Dismiss state ─────────────────────────────────────────────────────────────
const DISMISS_KEY = "ccd.install_dismissed_at";
const COOLDOWN_DAYS = 30;

function wasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    const daysAgo = (Date.now() - parseInt(ts, 10)) / (1000 * 60 * 60 * 24);
    return daysAgo < COOLDOWN_DAYS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────

export function InstallPromptBanner() {
  // Stored `beforeinstallprompt` event (Android/Chrome)
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [showAndroid, setShowAndroid]       = useState(false);
  const [showIOS, setShowIOS]               = useState(false);
  const [iosStep, setIosStep]               = useState(0); // 0 = sheet closed, 1 = sheet open

  useEffect(() => {
    if (isInstalled()) return;
    if (wasDismissedRecently()) return;

    // Android / Chrome — capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as typeof deferredPrompt);
      setShowAndroid(true);
      track("pwa_install_prompt_shown", { platform: "android" });
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari — show manual sheet after 30s on first visit
    if (isIOSSafari()) {
      const t = setTimeout(() => {
        setShowIOS(true);
        setIosStep(1);
        track("pwa_install_prompt_shown", { platform: "ios" });
      }, 30_000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(t);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    track("pwa_install_clicked", { platform: "android" });
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    track("pwa_install_outcome", { platform: "android", outcome });
    setShowAndroid(false);
    setDeferredPrompt(null);
    if (outcome === "accepted") markDismissed();
  }, [deferredPrompt]);

  const dismiss = useCallback((platform: string) => {
    track("pwa_install_dismissed", { platform });
    markDismissed();
    setShowAndroid(false);
    setShowIOS(false);
    setIosStep(0);
  }, []);

  // ── Android banner ────────────────────────────────────────────────────────
  if (showAndroid) {
    return (
      <div
        role="banner"
        aria-label="Install CCD.SCHOOL as an app"
        className="fixed install-banner-offset left-3 right-3 z-50 brutal-border bg-ink text-bone brutal-shadow
                   animate-fade-up sm:left-auto sm:right-4 sm:w-80"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-bone/20">
          {/* App icon */}
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 brutal-border border-bone/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="CCD.SCHOOL icon" width={40} height={40} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-base leading-tight">CCD.SCHOOL</div>
            <div className="font-mono text-[10px] opacity-50 truncate">ccd.school</div>
          </div>
          <button
            onClick={() => dismiss("android")}
            aria-label="Dismiss install prompt"
            className="shrink-0 opacity-40 hover:opacity-100 transition-opacity p-1 -mr-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <p className="font-mono text-xs leading-relaxed opacity-80">
            Install for offline lessons, push reminders &amp; a full phone-app experience.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={handleAndroidInstall}
            className="flex-1 brutal-border bg-acid text-ink py-3 font-display text-base brutal-press"
            aria-label="Install app"
          >
            INSTALL FREE
          </button>
          <button
            onClick={() => dismiss("android")}
            className="brutal-border bg-bone/10 px-4 py-3 font-mono text-[10px] uppercase brutal-press hover:bg-bone/20"
            aria-label="Not now"
          >
            Later
          </button>
        </div>
      </div>
    );
  }

  // ── iOS bottom sheet ──────────────────────────────────────────────────────
  if (showIOS && iosStep > 0) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-ink/50"
          onClick={() => dismiss("ios")}
          aria-hidden
        />

        {/* Sheet */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add CCD.SCHOOL to Home Screen"
          className="fixed bottom-0 left-0 right-0 z-50 brutal-border border-b-0 bg-bone text-ink
                     rounded-t-2xl pt-2 pb-safe animate-slide-up"
        >
          {/* Handle */}
          <div className="w-10 h-1 rounded-full bg-ink/20 mx-auto mb-4" aria-hidden />

          <div className="px-6 pb-8 space-y-5 max-w-sm mx-auto">
            <div>
              <div className="font-display text-2xl leading-tight">Add to your<br />Home Screen</div>
              <p className="font-mono text-xs opacity-60 mt-1">
                Works like a real app — no App Store needed.
              </p>
            </div>

            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 brutal-border bg-ink text-bone flex items-center justify-center font-display text-lg shrink-0">
                1
              </div>
              <div>
                <div className="font-mono text-sm font-bold">Tap the Share button</div>
                <div className="font-mono text-xs opacity-60 mt-0.5 leading-relaxed">
                  The <span className="font-bold opacity-100">⬆</span> icon at the bottom of Safari (or top-right on iPad).
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 brutal-border bg-ink text-bone flex items-center justify-center font-display text-lg shrink-0">
                2
              </div>
              <div>
                <div className="font-mono text-sm font-bold">Tap "Add to Home Screen"</div>
                <div className="font-mono text-xs opacity-60 mt-0.5 leading-relaxed">
                  Scroll down in the share sheet until you see it.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 brutal-border bg-acid text-ink flex items-center justify-center font-display text-lg shrink-0">
                3
              </div>
              <div>
                <div className="font-mono text-sm font-bold">Tap "Add" — done!</div>
                <div className="font-mono text-xs opacity-60 mt-0.5 leading-relaxed">
                  CCD.SCHOOL will appear on your Home Screen like any app.
                </div>
              </div>
            </div>

            <button
              onClick={() => dismiss("ios")}
              className="w-full brutal-border bg-ink text-bone py-4 font-display text-xl brutal-press brutal-shadow"
              aria-label="Got it, close"
            >
              GOT IT
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
}
