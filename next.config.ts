import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate a self-contained server bundle for Docker/`node server.js`.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Public R2 custom domain (configure via env when ready)
      ...(process.env.R2_PUBLIC_HOSTNAME
        ? [{ protocol: "https" as const, hostname: process.env.R2_PUBLIC_HOSTNAME }]
        : []),
    ],
  },
  experimental: {
    serverActions: {
      // Allow uploading slightly larger payloads via form actions
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
