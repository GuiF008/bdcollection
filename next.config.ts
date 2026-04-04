import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/catalog-series/:id", destination: "/catalog/:id", permanent: true },
      { source: "/series", destination: "/catalog", permanent: true },
      { source: "/albums", destination: "/collection", permanent: true },
    ];
  },
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
