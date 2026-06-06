/**
 * CCD.SCHOOL Service Worker
 *
 * Responsibilities:
 *   1. Cache-first strategy for static assets (fonts, JS, CSS)
 *   2. Network-first for API and page routes
 *   3. Handle push notifications (streak reminders, daily challenge alerts)
 *   4. Background sync for progress events when offline
 */

const CACHE_NAME = "ccd-school-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.svg",
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Take control immediately
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch strategy ───────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // API routes: network-only (no cache)
  if (url.pathname.startsWith("/api/")) return;

  // Next.js internals: network-only
  if (url.pathname.startsWith("/_next/")) return;

  // Static assets: cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|png|svg|ico|webp|jpg|jpeg)$/) ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Pages: network-first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});

// ─── Push notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "CCD.SCHOOL", body: "Time to practice! 🎵", url: "/learn" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: "ccd-reminder",
      data: { url: data.url },
      requireInteraction: false,
      actions: [
        { action: "open", title: "Practice now →" },
        { action: "dismiss", title: "Later" },
      ],
    })
  );
});

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url ?? "/learn";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(location.origin));
        if (existing) {
          existing.focus();
          existing.navigate(targetUrl);
        } else {
          self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── Background sync (offline progress queue) ─────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "progress-sync") {
    event.waitUntil(flushOfflineQueue());
  }
});

async function flushOfflineQueue() {
  try {
    const db = await openOfflineDB();
    const events = await getQueuedEvents(db);
    if (!events.length) return;

    const res = await fetch("/api/progress/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    });

    if (res.ok) {
      await clearQueue(db);
    }
  } catch {
    // Will retry on next sync
  }
}

// Simple IndexedDB queue for offline progress events
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("ccd-offline", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("events", { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getQueuedEvents(db) {
  return new Promise((resolve) => {
    const tx = db.transaction("events", "readonly");
    const req = tx.objectStore("events").getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => resolve([]);
  });
}

function clearQueue(db) {
  return new Promise((resolve) => {
    const tx = db.transaction("events", "readwrite");
    tx.objectStore("events").clear();
    tx.oncomplete = resolve;
  });
}
