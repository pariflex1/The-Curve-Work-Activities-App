import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

