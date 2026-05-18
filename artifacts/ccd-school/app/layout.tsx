import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { Header } from "@/components/Header";

const SITE_URL = "https://ccd.school";
const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c50e31e5-eb8c-4cc9-ad9a-bc948d5719c2";

export const viewport: Viewport = {
  themeColor: "#CDFF00",
};

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CCD.SCHOOL",
  },
};

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
    {
      "@type": "Course",
      name: "Fundamentals",
      description:
        "Sound, rhythm, melody, harmony, and music technology basics",
    },
    {
      "@type": "Course",
      name: "DJ World",
      description: "rekordbox, beatmatching, crowd reading and DJ career",
    },
    {
      "@type": "Course",
      name: "Producer",
      description: "Ableton Live 12 from zero to expert",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ClientProviders>
          <div className="min-h-screen flex flex-col bg-bone text-ink">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="brutal-border border-x-0 border-b-0 bg-ink text-bone px-4 py-2 font-mono text-[10px] uppercase tracking-widest">
              CCD.SCHOOL · CATSCANDANCE · 2026
            </footer>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
