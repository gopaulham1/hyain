import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s1.ticketm.net",
      },
      {
        protocol: "https",
        hostname: "s1.ticketm.com",
      },
      {
        protocol: "https",
        hostname: "images.universe.com",
      },
      {
        protocol: "https",
        hostname: "www.ticketmaster.com",
      },
      {
        protocol: "https",
        hostname: "www.ticketmaster.co.uk",
      },
    ],
  },
};

export default nextConfig;
