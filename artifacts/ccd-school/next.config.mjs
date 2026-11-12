// Report-only for now: nothing is blocked; violations are logged by /api/csp-report (Vercel logs).
// 'wasm-unsafe-eval' is for the sound engine (WebAssembly). Enforce once the log is clean.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://checkout.razorpay.com https://js.stripe.com https://va.vercel-scripts.com https://*.posthog.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: data: https://kpxywzhwcptvfdocnazd.supabase.co",
  "connect-src 'self' blob: data: https://*.posthog.com https://api.razorpay.com https://lumberjack.razorpay.com https://api.stripe.com https://vitals.vercel-insights.com https://kpxywzhwcptvfdocnazd.supabase.co",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://js.stripe.com https://checkout.stripe.com https://www.youtube.com https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com https://checkout.stripe.com",
  "frame-ancestors 'self'",
  "report-uri /api/csp-report",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  poweredByHeader: false,
  // Baseline security headers (9 Nov 2026 audit). Microphone and MIDI stay on for recording and controllers.
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Content-Security-Policy-Report-Only", value: CSP },
        { key: "Permissions-Policy", value: "camera=(), microphone=(self), midi=(self), geolocation=(), payment=(self \"https://checkout.razorpay.com\" \"https://js.stripe.com\")" },
      ],
    }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      // FAL AI generated image CDN
      { protocol: "https", hostname: "v3b.fal.media" },
      { protocol: "https", hostname: "fal.media" },
    ],
  },
};

export default nextConfig;
