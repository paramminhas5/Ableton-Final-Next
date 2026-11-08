"use client";
/**
 * Sends the learning events waiting on the device (src/lib/learnEvents.ts) once the learner is signed in:
 * on sign-in, every 30 seconds while any wait, and when the page is hidden. Notes the visit once per load
 * (came back, came back the next day). Signed out, nothing is sent; the events wait.
 */
import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { dropSent, noteVisit, pendingEvents } from "@/lib/learnEvents";

export function LearnSync() {
  const { user } = useAuth();
  const busy = useRef(false);
  useEffect(() => { try { noteVisit(); } catch { /* storage blocked */ } }, []);
  useEffect(() => {
    if (!user) return;
    const send = async () => {
      if (busy.current) return;
      const q = pendingEvents().slice(0, 200);
      if (!q.length) return;
      busy.current = true;
      try {
        const r = await fetch("/api/learn/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ events: q }) });
        if (r.ok) { const d = await r.json().catch(() => ({})); dropSent(typeof d.taken === "number" ? d.taken : q.length); }
      } catch { /* offline: try again later */ } finally { busy.current = false; }
    };
    const hide = () => {
      if (document.visibilityState !== "hidden") return;
      const q = pendingEvents().slice(0, 200);
      if (!q.length || !navigator.sendBeacon) return;
      // A beacon can't read the answer: once the browser has taken it, the events count as sent.
      if (navigator.sendBeacon("/api/learn/events", new Blob([JSON.stringify({ events: q })], { type: "application/json" }))) dropSent(q.length);
    };
    void send();
    const id = window.setInterval(() => void send(), 30000);
    document.addEventListener("visibilitychange", hide);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", hide); };
  }, [user]);
  return null;
}
