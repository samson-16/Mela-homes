import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/users/:path*",
        destination: "https://mela-homes-backend.onrender.com/api/users/:path*",
      },
    ]
  },
};

export default nextConfig;
