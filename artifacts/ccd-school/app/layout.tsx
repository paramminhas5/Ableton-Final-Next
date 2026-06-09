import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { Header } from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = "https://ccd.school";
// FAL AI generated OG image — brutalist three-zone music poster (v2)
const OG_IMAGE =
  "https://v3b.fal.media/files/b/0a9d8573/kIC5zvi9T5FiU2uyp8GEM.jpg";

// ─── Viewport — controls status bar colour on mobile ─────────────────────────
export const viewport: Viewport = {
  // Orange matches the app icon background
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF3C00" },
    { media: "(prefers-color-scheme: dark)",  color: "#FF3C00" },
  ],
  // Respect device width on phones; allow user to scale
  width: "device-width",
  initialScale: 1,
  // Let content extend under the iPhone notch / Dynamic Island
  viewportFit: "cover",
};

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "CCD.SCHOOL — Learn Music Production & DJing",
    template: "%s | CCD.SCHOOL",
  },
  description:
    "The most structured music education on the internet. 153 missions across Fundamentals, DJ World, and Producer. Gamified, source-verified, brutally effective.",
  keywords: [
    "Ableton Live 12",
    "music production",
    "DJ tutorial",
    "rekordbox",
    "music theory",
    "beatmatching",
    "synthesizer",
    "music education",
    "CatsCanDance",
  ],
  authors: [{ name: "CCD.SCHOOL" }],
  creator: "CCD.SCHOOL",
  publisher: "CatsCanDance",

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  // PWA manifest
  manifest: "/manifest.json",

  // ── Open Graph ──────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    siteName: "CCD.SCHOOL",
    title: "CCD.SCHOOL — Learn Music Production & DJing",
    description:
      "153 missions across Fundamentals, DJ World, and Producer. Gamified, source-verified, brutally effective.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "CCD.SCHOOL" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CCD.SCHOOL — Learn Music Production & DJing",
    description:
      "153 missions across Fundamentals, DJ World, and Producer. Gamified, source-verified, brutally effective.",
    images: [OG_IMAGE],
  },

  // ── iOS / Apple PWA ─────────────────────────────────────────────────────────
  // These tell iOS Safari to treat the site as a standalone app when added
  // to the Home Screen, and set the status bar appearance.
  appleWebApp: {
    capable: true,
    title: "CCD.SCHOOL",
    // "black-translucent" lets the app extend behind the status bar (full-bleed)
    statusBarStyle: "black-translucent",
    // Apple touch icons (Safari uses the first matching size)
    startupImage: [
      // iPhone 15 Pro Max (430×932 logical, 3× scale → 1290×2796)
      { url: "/splash/apple-splash-1290-2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 15 / 14 Pro (393×852 logical, 3×)
      { url: "/splash/apple-splash-1179-2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 14 (390×844 logical, 3×)
      { url: "/splash/apple-splash-1170-2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone SE 3rd gen (375×667 logical, 2×)
      { url: "/splash/apple-splash-750-1334.png",  media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
    ],
  },

  // Standard favicon set
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png",   sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png",           sizes: "180x180" },
      { url: "/icons/apple-touch-icon-167.png", sizes: "167x167" },
      { url: "/icons/apple-touch-icon-152.png", sizes: "152x152" },
      { url: "/icons/apple-touch-icon-120.png", sizes: "120x120" },
    ],
  },
};

// ─── JSON-LD structured data ──────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "CCD.SCHOOL",
  url: SITE_URL,
  description:
    "Gamified music education platform covering Ableton Live 12, DJing with rekordbox, and music theory fundamentals.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free music production and DJ education",
  },
  hasCourse: [
    { "@type": "Course", name: "Fundamentals", description: "Sound, rhythm, melody, harmony, and music technology basics" },
    { "@type": "Course", name: "DJ World",     description: "rekordbox, beatmatching, crowd reading and DJ career" },
    { "@type": "Course", name: "Producer",     description: "Ableton Live 12 from zero to expert" },
  ],
};

// ─── Root layout ──────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── Fonts: preload prevents render-blocking, display=swap eliminates FOUT ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Archivo Black — display font (headings) */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"
          media="print"
          // @ts-expect-error – string onLoad is intentional for perf (not a React event)
          onLoad="this.media='all'"
        />
        {/* Space Mono — monospaced body + labels */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
          media="print"
          // @ts-expect-error – string onLoad is intentional for perf (not a React event)
          onLoad="this.media='all'"
        />
        {/* Space Grotesk — sans body text */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          media="print"
          // @ts-expect-error – string onLoad is intentional for perf (not a React event)
          onLoad="this.media='all'"
        />
        {/* Fallback noscript for environments without JS */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;700&display=swap" />
        </noscript>

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Inline theme init — runs before first paint, no flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('ccd.theme') || 'ccd-classic';
            document.documentElement.setAttribute('data-theme', t);
            var m = localStorage.getItem('ccd.learnMode') || 'classic';
            document.documentElement.setAttribute('data-learn-mode', m);
          } catch(e) {}
        ` }} />

        {/*
          iOS-specific: register the service worker early so that push
          permission requests work on iOS 16.4+ (requires HTTPS + SW).
          We register it here too (in addition to push.ts) so it's
          available on first load before any React hydration.
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .catch(function(e) { console.warn('[SW]', e); });
            });
          }
        ` }} />
      </head>

      <body
        // Safe-area padding for iPhone notch / Dynamic Island
        // (content will be inset from the notch automatically)
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Skip-to-content for keyboard / screen-reader users */}
        <a href="#main-content" className="skip-link">Skip to content</a>

        <ClientProviders>
          <div className="min-h-screen flex flex-col bg-bone text-ink">
            <Header />
            <main id="main-content" className="flex-1">{children}</main>
            {/* Footer hidden on mobile — bottom nav takes its place */}
            <footer className="hidden md:block brutal-border border-x-0 border-b-0 bg-ink text-bone px-4 py-2 font-mono text-[10px] uppercase tracking-widest">
              CCD.SCHOOL · CATSCANDANCE · 2026
            </footer>
          </div>
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
