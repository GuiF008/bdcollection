import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.bedetheque.com", pathname: "/**" },
      { protocol: "https", hostname: "bedetheque.com", pathname: "/**" },
    ],
    unoptimized: false,
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
