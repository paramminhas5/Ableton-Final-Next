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
