/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  allowedDevOrigins: ["*.replit.dev", "*.worf.replit.dev", "*.replit.app"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
};

export default nextConfig;
