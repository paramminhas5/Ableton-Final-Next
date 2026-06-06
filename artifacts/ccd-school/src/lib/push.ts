/**
 * push.ts — Web Push subscription management for CCD.SCHOOL
 *
 * Flow:
 *   1. Register service worker (sw.js)
 *   2. Subscribe to push with VAPID public key
 *   3. POST subscription to /api/push/subscribe
 *   4. Server sends push via /api/push/send (cron or event-triggered)
 *
 * Streak reminder is the primary use-case:
 *   - Triggered at 20:00 local time if daily goal not met
 *   - Uses the browser's native push delivery (survives app closure)
 *
 * To enable: set NEXT_PUBLIC_VAPID_PUBLIC_KEY in env.
 * Generate keys: npx web-push generate-vapid-keys
 */

export type PushSubscriptionData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

/** Register the service worker. Safe to call multiple times. */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch (err) {
    console.warn("[push] SW registration failed:", err);
    return null;
  }
}

/** Check current notification permission */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/** Request permission and subscribe to push. Returns the subscription or null. */
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.warn("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
    return null;
  }

  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[push] Push not supported in this browser");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const reg = await registerServiceWorker();
    if (!reg) return null;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    const json = sub.toJSON() as PushSubscriptionData;
    return json;
  } catch (err) {
    console.warn("[push] Subscribe failed:", err);
    return null;
  }
}

/** Send subscription to server for storage */
export async function saveSubscription(sub: PushSubscriptionData): Promise<boolean> {
  try {
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Unsubscribe from push and notify server */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return true;
    const ok = await sub.unsubscribe();
    if (ok) {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
    }
    return ok;
  } catch {
    return false;
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
