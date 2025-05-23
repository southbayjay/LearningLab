import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages configuration
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
