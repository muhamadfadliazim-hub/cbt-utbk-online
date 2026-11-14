import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*.vercel.app", "*.trycloudflare.com", "localhost:3000", "localhost:3150"],
    },
  },
};

export default nextConfig;
