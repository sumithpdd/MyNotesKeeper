import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure environment variables are loaded
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  
  // Turbopack configuration - specify project root to avoid lockfile detection warning
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
};

export default nextConfig;
